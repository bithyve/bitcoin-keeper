import { Pressable, StyleSheet, Text } from 'react-native';
import React from 'react';
import { hp } from 'src/common/data/responsiveness/responsive';
import HideIcon from 'src/assets/images/icon_hide.svg';
import ShowIcon from 'src/assets/images/icon_show.svg'

function BalanceToggle({ hideAmounts, setHideAmounts, routeName }) {
  const toggleCurrencyVisibility = () => setHideAmounts(!hideAmounts);
  return (
    <Pressable style={styles.hideBalanceWrapper}>
      {hideAmounts ? <ShowIcon /> : <HideIcon />}
      <Text style={[styles.hideBalanceText, { color: routeName === 'Vault' ? "#704E2E" : '#2D6759' }]} onPress={toggleCurrencyVisibility}>
        &nbsp;&nbsp;{`${hideAmounts ? 'SHOW' : 'HIDE'} BALANCES`}
      </Text>
    </Pressable>
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
  },
});
