import { Dimensions, StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import React, { useContext } from 'react';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import Note from 'src/components/Note/Note';
import UploadFile from 'src/components/UploadFile';
import useConfigRecovery from 'src/hooks/useConfigReocvery';
import QRScanner from 'src/components/QRScanner';

const { width } = Dimensions.get('screen');

function ScanQRFileRecovery({ route }) {
  const { colorMode } = useColorMode();
  const { allowFileUploads = true } = route.params || {};
  const { initateRecovery } = useConfigRecovery();
  const { translations } = useContext(LocalizationContext);

  const { common } = translations;

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <Box flex={1}>
        <KeeperHeader
          title="Recover Using Wallet Configuration File"
          subtitle="Recover the vault from output descriptor/configuration/BSMS File"
        />
        <QRScanner onScanCompleted={initateRecovery} />
        {allowFileUploads && <UploadFile fileHandler={initateRecovery} />}
        <Box style={styles.noteWrapper}>
          <Note
            title={common.note}
            subtitle="Make sure that the QR is well aligned, focused and visible as a whole"
            subtitleColor="GreyText"
          />
        </Box>
      </Box>
    </ScreenWrapper>
  );
}
const styles = StyleSheet.create({
  qrcontainer: {
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 15,
    alignItems: 'center',
  },
  cameraView: {
    height: width * 0.9,
    width: width * 0.9,
  },
  noteWrapper: {
    width: '100%',
    bottom: 0,
    position: 'absolute',
    paddingHorizontal: 20,
  },
});

export default ScanQRFileRecovery;
