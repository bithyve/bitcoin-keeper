import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Box, Text } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { EntityKind, NetworkType, SignerStorage, SignerType } from 'src/core/wallets/enums';
import React, { useContext, useEffect, useState } from 'react';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

import AppClient from 'src/hardware/ledger';
import KeeperModal from 'src/components/KeeperModal';
import { LocalizationContext } from 'src/common/content/LocContext';
import { TapGestureHandler } from 'react-native-gesture-handler';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import { captureError } from 'src/core/services/sentry';
import { checkSigningDevice } from '../Vault/AddSigningDevice';
import config from 'src/core/config';
import { generateMockExtendedKeyForSigner } from 'src/core/wallets/factories/VaultFactory';
import useBLE from 'src/hooks/useLedger';
import { useDispatch } from 'react-redux';

const AddLedger = ({}) => {
  const {
    scanForPeripherals,
    requestPermissions,
    connectToDevice,
    allDevices,
    disconnectFromDevice,
    transport,
    isScanning,
  } = useBLE();

  const scanForDevices = () => {
    requestPermissions((isGranted) => {
      if (isGranted) {
        scanForPeripherals();
      }
    });
  };
  const [visible, setVisible] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const { translations } = useContext(LocalizationContext);
  const ledger = translations['ledger'];
  const open = () => setVisible(true);
  const navigation = useNavigation();
  const close = () => {
    navigation.goBack();
  };
  const dispatch = useDispatch();

  useEffect(() => {
    open();
  }, []);

  useEffect(() => {
    if (transport) {
      fetchAddress();
    }
  }, [transport]);

  useEffect(() => {
    scanForDevices();
    return () => {
      setVisible(false);
      disconnectFromDevice();
    };
  }, []);

  const Item = ({ device }) => {
    return (
      <TouchableOpacity
        style={styles.deviceItem}
        onPress={() => {
          setConnecting(true);
          connectToDevice(device);
        }}
      >
        <Text style={styles.deviceName}>{device.name}</Text>
      </TouchableOpacity>
    );
  };

  const LedgerSetupContent = () => {
    return (
      <TapGestureHandler numberOfTaps={3} onActivated={addMockLedger}>
        <View>
          {isScanning && !allDevices.length ? (
            <Image
              source={require('src/assets/video/Loader.gif')}
              style={{
                width: wp(250),
                height: wp(100),
                alignSelf: 'center',
                marginTop: hp(30),
              }}
            />
          ) : null}
          {connecting ? (
            <ActivityIndicator />
          ) : (
            <Box ml={wp(21)}>
              {allDevices.map((device) => {
                return <Item device={device} />;
              })}
            </Box>
          )}
          <Box marginTop={'4'}>
            <Text color={'#073B36'} fontSize={13} fontFamily={'body'} fontWeight={'100'} p={1}>
              {`Please open on the BTC app before connecting to the deivce`}
            </Text>
          </Box>
        </View>
      </TapGestureHandler>
    );
  };

  const getMockLedgerDetails = (amfData = null) => {
    const networkType = config.NETWORK_TYPE;
    const network = WalletUtilities.getNetworkByType(networkType);
    const { xpub, xpriv, derivationPath, masterFingerprint } = generateMockExtendedKeyForSigner(
      EntityKind.VAULT,
      SignerType.LEDGER,
      networkType
    );
    const signerId = WalletUtilities.getFingerprintFromExtendedKey(xpub, network);
    const ledger: VaultSigner = {
      signerId,
      type: SignerType.LEDGER,
      signerName: 'Nano X**',
      isMock: true,
      xpub,
      xpriv,
      xpubInfo: {
        derivationPath,
        xfp: masterFingerprint,
      },
      lastHealthCheck: new Date(),
      addedOn: new Date(),
      storageType: SignerStorage.COLD,
    };
    if (amfData) {
      ledger.amfData = amfData;
      ledger.signerName = 'Nano X*';
      ledger.isMock = false;
    }
    return ledger;
  };

  const fetchAddress = async () => {
    try {
      const app = new AppClient(transport);
      const networkType = config.NETWORK_TYPE;
      const path = networkType === NetworkType.TESTNET ? "m/48'/1'/0'/1'" : "m/48'/0'/0'/1'"; // m / purpose' / coin_type' / account' / script_type' / change / address_index bip-48
      const xpub = await app.getExtendedPubkey(path);
      const masterfp = await app.getMasterFingerprint();
      const network = WalletUtilities.getNetworkByType(networkType);
      const ledger: VaultSigner = {
        signerId: WalletUtilities.getFingerprintFromExtendedKey(xpub, network),
        type: SignerType.LEDGER,
        signerName: 'Nano X',
        xpub,
        xpubInfo: {
          derivationPath: path,
          xfp: masterfp,
        },
        lastHealthCheck: new Date(),
        addedOn: new Date(),
        storageType: SignerStorage.COLD,
      };
      if (networkType === NetworkType.TESTNET) {
        const signerId = WalletUtilities.getFingerprintFromExtendedKey(xpub, network);
        addMockLedger({ signerId, xpub });
        return;
      }
      dispatch(addSigningDevice(ledger));
      navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
      const exsists = await checkSigningDevice(ledger.signerId);
      if (exsists) Alert.alert('Warning: Vault with this signer already exisits');
    } catch (error) {
      captureError(error);
      Alert.alert(error.toString());
    }
  };

  const addMockLedger = (amfData = null) => {
    const ledger = getMockLedgerDetails(amfData);
    dispatch(addSigningDevice(ledger));
    navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeeperModal
        closeOnOverlayClick={false}
        visible={visible}
        close={close}
        title={ledger.ScanningBT}
        subTitle={ledger.KeepLedgerReady}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        textColor={'#041513'}
        Content={LedgerSetupContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  deviceItem: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginVertical: 8,
    marginHorizontal: 16,
    borderColor: '#ccc',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deviceName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default AddLedger;
