import React from 'react';
import { Box, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import { StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import EmptyWalletListIllustration from 'src/assets/images/empty_wallets_list_illustration.svg';

function WalletInfoEmptyState() {
  const { colorMode } = useColorMode();

  return (
    <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.walletContainer}>
      <EmptyWalletListIllustration />
      <Box style={styles.emptyWalletText}>
        <Text fontSize={12} color={`${colorMode}.hexagonIconBackColor`}>
          You don't have any wallets yet
        </Text>
      </Box>
    </Box>
  );
}

export default WalletInfoEmptyState;

const styles = StyleSheet.create({
  walletContainer: {
    width: wp(160),
    height: hp(260),
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(10),
  },
  emptyWalletText: {
    position: 'absolute',
    width: 80,
    opacity: 0.8,
  },
});
