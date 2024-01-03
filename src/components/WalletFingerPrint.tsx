import { Box, useColorMode } from 'native-base';
import Text from './KeeperText';
import CopyIcon from 'src/assets/images/icon_copy.svg';
import { StyleSheet } from 'react-native';

type Props = {
  fingerprint: string;
};

function WalletFingerprint({ fingerprint }: Props) {
  const { colorMode } = useColorMode();
  return (
    <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.container}>
      <Box>
        <Text color={`${colorMode}.black`} style={styles.heading}>
          Wallet Fingerprint
        </Text>
        <Text color={`${colorMode}.GreenishGrey`} style={styles.value}>
          {fingerprint}
        </Text>
      </Box>
      <CopyIcon />
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    width: '90%',
    borderRadius: 10,
  },
  heading: {
    fontSize: 14,
  },
  value: {
    fontSize: 16,
  },
});

export default WalletFingerprint;
