import { Box } from 'native-base';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import CurrencyInfo from 'src/screens/Home/components/CurrencyInfo';
import Colors from 'src/theme/Colors';

function BalanceComponent({ balance, isShowAmount, setIsShowAmount }) {
  const handleToggle = (e) => {
    e.stopPropagation();
    setIsShowAmount(!isShowAmount);
  };

  return (
    <Box style={styles.walletWrapper}>
      <TouchableOpacity
        testID="btn_hideUnhideAmount"
        onPress={handleToggle}
        style={styles.amount}
        activeOpacity={0.7}
      >
        <CurrencyInfo
          amount={balance}
          hideAmounts={!isShowAmount}
          fontSize={19}
          color={Colors.SecondaryWhite}
          variation="light"
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
  amount: {
    minHeight: hp(25),
    textAlign: 'center',
    gap: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});
