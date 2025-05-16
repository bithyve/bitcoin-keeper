import { Box, useColorMode } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { wp } from 'src/constants/responsive';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';

function BackupModalContent() {
  const { colorMode } = useColorMode();
  return (
    <Box style={styles.contentContainer}>
      <Box style={styles.passImg}>
        <ThemedSvg name={'backup_modal'} />
      </Box>
      <Text color={`${colorMode}.textGreen`} medium style={styles.modalHeading}>
        Beware
      </Text>
      <Text color={`${colorMode}.secondaryText`} style={styles.modalMessageText}>
        Anyone with access to the Recovery Key can access and withdraw your funds. Losing them means
        you can’t recover your wallet.
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
