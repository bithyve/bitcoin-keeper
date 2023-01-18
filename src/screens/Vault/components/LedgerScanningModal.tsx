import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import KeeperModal from 'src/components/KeeperModal';
import { LocalizationContext } from 'src/common/content/LocContext';
import useBLE from 'src/hooks/useLedger';
import { Box, HStack, VStack } from 'native-base';
import { globalStyles } from 'src/common/globalStyles';
import { windowWidth } from 'src/common/data/responsiveness/responsive';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import { SignerType } from 'src/core/wallets/enums';
import Text from 'src/components/KeeperText';
import { useNavigation } from '@react-navigation/native';
import { WalletMap } from '../WalletMap';

function LedgerContent({
  isScanning,
  allDevices,
  interacting,
  setInteracting,
  connectToDevice,
  interactionText,
  infoText,
}: any) {
  return (
    <View>
      {isScanning && !allDevices.length ? (
        <Image source={require('src/assets/video/Loader.gif')} style={styles.loader} />
      ) : null}
      {allDevices.map((device) => (
        <TouchableOpacity
          style={{ marginBottom: 30 }}
          onPress={() => {
            setInteracting(true);
            connectToDevice(device);
          }}
        >
          <HStack
            style={[
              globalStyles.centerRow,
              { justifyContent: 'space-between', width: windowWidth * 0.7 },
            ]}
          >
            <HStack style={[globalStyles.centerRow]}>
              <Box style={styles.icon}>{WalletMap(SignerType.LEDGER, true).Icon}</Box>
              <VStack style={{ paddingLeft: 20 }}>
                <Text style={[globalStyles.font14, { letterSpacing: 1.12 }]}>{device.name}</Text>
                <Text style={[globalStyles.font12, { letterSpacing: 0.6 }]}>
                  {interacting ? interactionText : infoText}
                </Text>
              </VStack>
            </HStack>
            <Box>{interacting ? <ActivityIndicator /> : <RightArrowIcon />}</Box>
          </HStack>
        </TouchableOpacity>
      ))}
      <Box>
        <Text color="light.greenText" light style={styles.instruct}>
          Please open on the BTC app before connecting to the deivce
        </Text>
      </Box>
    </View>
  );
}

function LedgerScanningModal({
  visible,
  setVisible,
  callback,
  interactionText,
  infoText,
  goBackOnDismiss = false,
}: {
  visible: boolean;
  setVisible;
  callback;
  interactionText: string;
  infoText: string;
  // eslint-disable-next-line react/require-default-props
  goBackOnDismiss?: boolean;
}) {
  const [interacting, setInteracting] = useState(false);
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { ledger } = translations;
  const close = () => {
    if (goBackOnDismiss) {
      navigation.goBack();
    }
    setVisible(false);
  };
  const {
    scanForPeripherals,
    requestPermissions,
    connectToDevice,
    allDevices,
    disconnectFromDevice,
    transport,
    isScanning,
  } = useBLE();

  const Content = useCallback(
    () => (
      <LedgerContent
        isScanning={isScanning}
        allDevices={allDevices}
        interacting={interacting}
        setInteracting={setInteracting}
        connectToDevice={connectToDevice}
        interactionText={interactionText}
        infoText={infoText}
      />
    ),
    [isScanning, allDevices, interacting]
  );

  const scanForDevices = () => {
    requestPermissions((isGranted) => {
      if (isGranted) {
        scanForPeripherals();
      }
    });
  };

  useEffect(() => {
    scanForDevices();
    return () => {
      setVisible(false);
      disconnectFromDevice();
    };
  }, []);

  useEffect(() => {
    if (transport) {
      callback(transport);
    }
  }, [transport]);

  return (
    <KeeperModal
      closeOnOverlayClick={false}
      visible={visible}
      close={close}
      title={ledger.ScanningBT}
      subTitle={ledger.KeepLedgerReady}
      textColor="light.primaryText"
      Content={Content}
    />
  );
}

export default LedgerScanningModal;

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
    width: 250,
    height: 100,
    alignSelf: 'center',
    marginTop: 30,
  },
  icon: {
    height: 30,
    width: 30,
    borderRadius: 30,
    backgroundColor: '#725436',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
