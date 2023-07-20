import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { hp } from 'src/common/data/responsiveness/responsive';
import HideIcon from 'src/assets/images/icon_hide.svg';
import ShowIcon from 'src/assets/images/icon_show.svg';

function BalanceToggle({ hideAmounts, setHideAmounts }) {
  const toggleCurrencyVisibility = () => setHideAmounts(!hideAmounts);
  return (
    <TouchableOpacity
      style={styles.hideBalanceWrapper}
      onPress={toggleCurrencyVisibility}
      hitSlop={{
        top: 20,
        bottom: 20,
        left: 10,
        right: 10,
      }}
      testID='btn_balanceToggle'
    >
      {hideAmounts ? <ShowIcon /> : <HideIcon />}
      <Text style={[styles.hideBalanceText, { color: hideAmounts ? '#2D6759' : '#704E2E' }]}>
        &nbsp;&nbsp;{`${hideAmounts ? 'SHOW' : 'HIDE'} BALANCES`}
      </Text>
    </TouchableOpacity>
  );
}

export default BalanceToggle;

const styles = StyleSheet.create({
  hideBalanceText: {
    fontSize: 10,
  },
  hideBalanceWrapper: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp(10),
    height: hp(20),
  },
});
