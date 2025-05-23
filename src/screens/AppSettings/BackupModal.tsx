import { Box, useColorMode } from 'native-base';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';

function BackupModalContent() {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common, signer } = translations;

  return (
    <Box style={styles.contentContainer}>
      <Box style={styles.passImg}>
        <ThemedSvg name={'backup_modal'} />
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
