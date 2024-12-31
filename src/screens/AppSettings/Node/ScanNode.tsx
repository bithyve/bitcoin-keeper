import { Box, useColorMode } from 'native-base';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import KeeperHeader from 'src/components/KeeperHeader';
import Note from 'src/components/Note/Note';
import QRScanner from 'src/components/QRScanner';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';

const ScanNode = ({ route }) => {
  const { onQrScan }: { onQrScan: (qrData: string) => void } = route.params;
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common, settings } = translations;
  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader title={settings.scanQRTitle} subtitle={settings.scanQRSubtitle} />
      <Box style={styles.container}>
        <QRScanner onScanCompleted={onQrScan} />
        <Box style={styles.noteWrapper}>
          <Note title={common.note} subtitle={common.scanQRNote} />
        </Box>
      </Box>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: hp(35),
    flex: 1,
    justifyContent: 'space-between',
  },
  noteWrapper: {
    paddingHorizontal: wp(15),
  },
});

export default ScanNode;
