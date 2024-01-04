import React from 'react';
import { Box, useColorMode } from 'native-base';
import CopyIcon from 'src/assets/images/copy.svg';
import { StyleSheet } from 'react-native';
import Text from './KeeperText';

type Props = {
  fingerprint: string;
};

function WalletFingerprint({ fingerprint }: Props) {
  const { colorMode } = useColorMode();
  return (
    <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.container}>
      <Box style={styles.textContainer}>
        <Text color={`${colorMode}.black`} style={styles.heading}>
          Wallet Fingerprint
        </Text>
        <Text color={`${colorMode}.GreenishGrey`} style={styles.value}>
          {fingerprint}
        </Text>
      </Box>
      <Box backgroundColor={`${colorMode}.OffWhite`} style={styles.iconContainer}>
        <CopyIcon />
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    borderRadius: 10,
    height: 60,
  },
  heading: {
    fontSize: 14,
  },
  value: {
    fontSize: 16,
  },
  iconContainer: {
    borderRadius: 10,
    margin: 2,
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: '95%',
  },
  textContainer: {
    margin: 10,
  },
});

export default WalletFingerprint;
