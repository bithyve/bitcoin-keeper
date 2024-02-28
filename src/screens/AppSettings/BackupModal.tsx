import { Box, useColorMode } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { wp } from 'src/constants/responsive';
import SeedwordsIllustration from 'src/assets/images/seedwords_illustration.svg';

function BackupModalContent() {
  const { colorMode } = useColorMode();
  return (
    <Box style={styles.contentContainer}>
      <Box style={styles.passImg}>
        <SeedwordsIllustration />
      </Box>
      <Text color={`${colorMode}.headerText`} style={styles.modalHeading}>
        Be aware
      </Text>
      <Text color={`${colorMode}.greenText`} style={styles.modalMessageText}>
        Anyone with access to the Recovery Key can access and withdraw your funds. Losing them means
        you can’t recover your wallet
      </Text>
    </Box>
  );
}

export default BackupModalContent;

const styles = StyleSheet.create({
  contentContainer: {
    width: wp(240),
    marginBottom: 20,
  },
  passImg: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  modalHeading: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    fontWeight: '700',
  },
  modalMessageText: {
    fontSize: 13,
    letterSpacing: 0.13,
  },
});
