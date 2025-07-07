import { Box } from 'native-base';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { hp, wp } from 'src/constants/responsive';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import CurrencyInfo from 'src/screens/Home/components/CurrencyInfo';
import { useAppSelector } from 'src/store/hooks';
import { setCurrencyKind } from 'src/store/reducers/settings';
import Colors from 'src/theme/Colors';

function BalanceComponent({ balance, isShowAmount, setIsShowAmount, BalanceFontSize, wallet }) {
  const dispatch = useDispatch();
  const { currencyKind } = useAppSelector((state) => state.settings);

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!isShowAmount) {
      setIsShowAmount(true);
      return;
    }

    // Cycle through currency kinds
    switch (currencyKind) {
      case CurrencyKind.BITCOIN:
        dispatch(setCurrencyKind(CurrencyKind.FIAT));
        break;
      case CurrencyKind.FIAT:
        dispatch(setCurrencyKind(CurrencyKind.BITCOIN));
        setIsShowAmount(false);
        break;
      default:
        dispatch(setCurrencyKind(CurrencyKind.BITCOIN));
    }
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
          fontSize={BalanceFontSize ? BalanceFontSize : 19}
          color={Colors.bodyText}
          variation="light"
          wallet={wallet}
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
