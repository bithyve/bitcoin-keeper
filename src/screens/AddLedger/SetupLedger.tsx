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
import { NetworkType, SignerStorage, SignerType } from 'src/core/wallets/enums';
import React, { useContext, useEffect, useState } from 'react';
import { getLedgerDetails, getMockLedgerDetails } from 'src/hardware/ledger';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

import KeeperModal from 'src/components/KeeperModal';
import { LocalizationContext } from 'src/common/content/LocContext';
import { TapGestureHandler } from 'react-native-gesture-handler';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import { captureError } from 'src/core/services/sentry';
import { checkSigningDevice } from '../Vault/AddSigningDevice';
import config from 'src/core/config';
import { generateSignerFromMetaData } from 'src/hardware';
import useBLE from 'src/hooks/useLedger';
import { useDispatch } from 'react-redux';

const AddLedger = () => {
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
      addLedger();
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

  const addMockLedger = (amfData = null) => {
    const ledger = getMockLedgerDetails(amfData);
    dispatch(addSigningDevice(ledger));
    navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
  };

  const isAMF = config.NETWORK_TYPE === NetworkType.TESTNET;

  const addLedger = async () => {
    try {
      const { xpub, xfp, derivationPath } = await getLedgerDetails(transport);
      const ledger: VaultSigner = generateSignerFromMetaData({
        xpub,
        xfp,
        derivationPath,
        storageType: SignerStorage.COLD,
        signerType: SignerType.LEDGER,
      });
      if (isAMF) {
        const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
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
