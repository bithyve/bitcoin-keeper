import { Box, HStack, useColorMode } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Text from 'src/components/KeeperText';
import CurrencyInfo from 'src/screens/Home/components/CurrencyInfo';
import Colors from 'src/theme/Colors';

function BalanceComponent({ balance, count, isShowAmount, setIsShowAmount }) {
  const { colorMode } = useColorMode();
  return (
    <Box style={styles.walletWrapper}>
      <HStack color={`${colorMode}.black`} space={1}>
        <Text style={styles.noOfWallet} bold>
          {count}
        </Text>
        <Text style={styles.noOfWallet}>Wallet{count > 1 && 's'}</Text>
      </HStack>
      <TouchableOpacity
        testID="btn_hideUnhideAmount"
        onPress={setIsShowAmount}
        style={styles.amount}
      >
        <CurrencyInfo
          amount={balance}
          hideAmounts={!isShowAmount}
          fontSize={26}
          color={colorMode === 'light' ? Colors.RichBlack : Colors.RichBlackDark}
          variation={colorMode === 'light' ? 'dark' : 'light'}
        />
      </TouchableOpacity>
    </Box>
  );
}

export default BalanceComponent;

const styles = StyleSheet.create({
  walletWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  noOfWallet: {
    fontSize: 22,
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
