import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Text from 'src/components/KeeperText';
import { Box } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { SignerStorage, SignerType } from 'src/core/wallets/enums';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { getLedgerDetails, getMockLedgerDetails } from 'src/hardware/ledger';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

import KeeperModal from 'src/components/KeeperModal';
import { LocalizationContext } from 'src/common/content/LocContext';
import { TapGestureHandler } from 'react-native-gesture-handler';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import { captureError } from 'src/core/services/sentry';
import config, { APP_STAGE } from 'src/core/config';
import { generateSignerFromMetaData } from 'src/hardware';
import useBLE from 'src/hooks/useLedger';
import { useDispatch } from 'react-redux';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { isTestnet } from 'src/common/constants/Bitcoin';
import { checkSigningDevice } from '../Vault/AddSigningDevice';

function Item({ device, setConnecting, connectToDevice }: any) {
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
}

function LedgerSetupContent({
  isScanning,
  allDevices,
  addMockLedger,
  connecting,
  setConnecting,
  connectToDevice,
}: any) {
  return (
    <TapGestureHandler numberOfTaps={3} onActivated={() => addMockLedger()}>
      <View>
        {isScanning && !allDevices.length ? (
          <Image source={require('src/assets/video/Loader.gif')} style={styles.loader} />
        ) : null}
        {connecting ? (
          <ActivityIndicator />
        ) : (
          <Box ml={wp(21)}>
            {allDevices.map((device) => (
              <Item
                device={device}
                setConnecting={setConnecting}
                connectToDevice={connectToDevice}
              />
            ))}
          </Box>
        )}
        <Box marginTop="4">
          <Text color="light.greenText" light style={styles.instruct}>
            Please open on the BTC app before connecting to the deivce
          </Text>
        </Box>
      </View>
    </TapGestureHandler>
  );
}

function AddLedger() {
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
  const { ledger } = translations;
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

  const { showToast } = useToastMessage();
  const addMockLedger = (amfData = null) => {
    if (config.ENVIRONMENT === APP_STAGE.DEVELOPMENT) {
      const ledger = getMockLedgerDetails(amfData);
      dispatch(addSigningDevice(ledger));
      navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
      showToast(`${ledger.signerName} added successfully`, <TickIcon />);
    }
  };

  const isAMF = isTestnet();

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
        const mockLedger = getMockLedgerDetails({ signerId, xpub });
        dispatch(addSigningDevice(mockLedger));
        navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
        return;
      }
      dispatch(addSigningDevice(ledger));
      navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
      showToast(`${ledger.signerName} added successfully`, <TickIcon />);
      const exsists = await checkSigningDevice(ledger.signerId);
      if (exsists) Alert.alert('Warning: Vault with this signer already exisits');
    } catch (error) {
      captureError(error);
      Alert.alert(error.toString());
    }
  };

  const Content = useCallback(
    () => (
      <LedgerSetupContent
        isScanning={isScanning}
        allDevices={allDevices}
        addMockLedger={addMockLedger}
        connecting={connecting}
        setConnecting={setConnecting}
        connectToDevice={connectToDevice}
      />
    ),
    [isScanning, allDevices, connecting]
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeeperModal
        closeOnOverlayClick={false}
        visible={visible}
        close={close}
        title={ledger.ScanningBT}
        subTitle={ledger.KeepLedgerReady}
        textColor="light.primaryText"
        Content={Content}
      />
    </SafeAreaView>
  );
}

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
  instruct: {
    fontSize: 13,
    padding: 1,
  },
  loader: {
    width: wp(250),
    height: wp(100),
    alignSelf: 'center',
    marginTop: hp(30),
  },
});

export default AddLedger;
