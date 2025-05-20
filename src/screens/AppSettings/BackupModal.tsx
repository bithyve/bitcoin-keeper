import { Box, useColorMode } from 'native-base';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { wp } from 'src/constants/responsive';
import SeedwordsIllustration from 'src/assets/images/seedwords_illustration.svg';
import BackupRecouveryPrivateIllustration from 'src/assets/privateImages/backup-recovery-key-illustration.svg';
import { useSelector } from 'react-redux';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function BackupModalContent() {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common, signer } = translations;
  const themeMode = useSelector((state: any) => state?.settings?.themeMode);
  const privateTheme = themeMode === 'PRIVATE';
  return (
    <Box style={styles.contentContainer}>
      <Box style={styles.passImg}>
        {privateTheme ? <BackupRecouveryPrivateIllustration /> : <SeedwordsIllustration />}
      </Box>
      <Text color={`${colorMode}.textGreen`} medium style={styles.modalHeading}>
        {common.Beware}
      </Text>
      <Text color={`${colorMode}.secondaryText`} style={styles.modalMessageText}>
        {signer.accessKeyWarning}
      </Text>
    </Box>
  );
}

export default BackupModalContent;

const styles = StyleSheet.create({
  contentContainer: {
    width: wp(300),
    marginBottom: 20,
  },
  passImg: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  modalHeading: {
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.14,
  },
  modalMessageText: {
    fontSize: 14,
  },
});
