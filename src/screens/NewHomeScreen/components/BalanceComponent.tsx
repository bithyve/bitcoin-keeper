import { Box, useColorMode } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import CurrencyInfo from 'src/screens/HomeScreen/components/CurrencyInfo';

function BalanceComponent({ balance, count }) {
  const { colorMode } = useColorMode();
  return (
    <Box style={styles.walletWrapper}>
      <Text color={`${colorMode}.black`} style={styles.noOfWallet}>
        <Text style={{ fontWeight: 'bold' }}>{count}</Text> Wallet{count > 1 && 's'}
      </Text>
      <Box style={styles.amount}>
        <CurrencyInfo
          hideAmounts={false}
          amount={balance}
          fontSize={27}
          color={`${colorMode}.primaryText`}
          variation="dark"
        />
      </Box>
    </Box>
  );
}

export default BalanceComponent;

const styles = StyleSheet.create({
  walletWrapper: {
    justifyContent: 'center',
    marginTop: 20,
  },
  noOfWallet: {
    textAlign: 'center',
    fontSize: 27,
    lineHeight: 27,
  },
  amount: {
    textAlign: 'center',
    gap: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});
