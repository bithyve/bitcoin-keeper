import { Pressable, StyleSheet, Text } from 'react-native';
import React from 'react';
import { hp } from 'src/common/data/responsiveness/responsive';
import HideIcon from 'src/assets/images/icon_hide.svg';

const BalanceToggle = ({ hideAmounts, setHideAmounts }) => {
  const toggleCurrencyVisibility = () => setHideAmounts(!hideAmounts);
  return (
    <Pressable style={styles.hideBalanceWrapper}>
      <HideIcon />
      <Text style={styles.hideBalanceText} onPress={toggleCurrencyVisibility}>
        &nbsp;&nbsp;{`${hideAmounts ? 'SHOW' : 'HIDE'} BALANCES`}
      </Text>
    </Pressable>
  );
};

export default BalanceToggle;

const styles = StyleSheet.create({
  hideBalanceText: {
    fontSize: 10,
    color: '#704E2E',
  },
  hideBalanceWrapper: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp(10),
  },
});
