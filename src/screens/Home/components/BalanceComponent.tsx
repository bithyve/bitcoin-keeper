import { Box, useColorMode } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { hp, wp } from 'src/constants/responsive';
import CurrencyInfo from 'src/screens/Home/components/CurrencyInfo';
import Colors from 'src/theme/Colors';

function BalanceComponent({ balance, isShowAmount, setIsShowAmount }) {
  const { colorMode } = useColorMode();
  return (
    <Box style={styles.walletWrapper}>
      <TouchableOpacity
        testID="btn_hideUnhideAmount"
        onPress={() => {
          setIsShowAmount(!isShowAmount);
        }}
        style={styles.amount}
      >
        <CurrencyInfo
          amount={balance}
          hideAmounts={!isShowAmount}
          fontSize={19}
          color={colorMode === 'light' ? Colors.SecondaryWhite : Colors.SecondaryWhite}
          variation={colorMode === 'light' ? 'light' : 'light'}
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
    fontSize: wp(20),
    lineHeight: 27,
    marginBottom: hp(3),
  },
  amount: {
    minHeight: hp(25),
    textAlign: 'center',
    gap: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});
