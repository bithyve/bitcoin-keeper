import { Box, useColorMode } from 'native-base';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

import BitcoinIcon from 'src/assets/images/icon_bitcoin.svg';

const BalanceComponent = ({ balance, count }) => {
  const { colorMode } = useColorMode();
  const styles = getStyles(colorMode);
  return (
    <Box style={styles.walletWrapper}>
      <Text style={styles.noOfWallet}>
        <Text style={{ fontWeight: 'bold' }}>{count}</Text> Wallet{count > 1 && 's'}
      </Text>
      <Box style={styles.amount}>
        <BitcoinIcon />
        <Text style={{ fontSize: 27 }}>{balance}</Text>
      </Box>
    </Box>
  );
};

export default BalanceComponent;

const getStyles = (colorMode) =>
  StyleSheet.create({
    walletWrapper: {
      justifyContent: 'center',
      marginTop: 20,
    },
    noOfWallet: {
      textAlign: 'center',
      fontSize: 27,
      color: `${colorMode}.black`,
    },
    amount: {
      textAlign: 'center',
      gap: 5,
      color: `${colorMode}.black`,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
  });
