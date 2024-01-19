import { Box, HStack, useColorMode } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import CurrencyInfo from 'src/screens/Home/components/CurrencyInfo';

function BalanceComponent({ balance, count }) {
  const { colorMode } = useColorMode();
  return (
    <Box style={styles.walletWrapper}>
      <HStack color={`${colorMode}.black`} space={2}>
        <Text style={[styles.noOfWallet, { fontWeight: 'bold' }]}>{count}</Text>
        <Text style={styles.noOfWallet}>Wallet{count > 1 && 's'}</Text>
      </HStack>
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
    marginHorizontal: 20,
  },
  noOfWallet: {
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
