import { StyleSheet } from 'react-native';
import React from 'react';
import { Box, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import { hp } from 'src/common/data/responsiveness/responsive';
import BtcBlack from 'src/assets/images/btc_black.svg';
import { getAmt, getCurrencyImageByRegion, getUnit } from 'src/common/constants/Bitcoin';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import { useAppSelector } from 'src/store/hooks';
import useExchangeRates from 'src/hooks/useExchangeRates';

function UTXOSelectionTotal(props: any) {
  const { selectionTotal, selectedUTXOs } = props;
  const currencyCode = useCurrencyCode();
  const exchangeRates = useExchangeRates();
  const { colorMode } = useColorMode();
  const { satsEnabled } = useAppSelector((state) => state.settings);

  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  return (
    <Box style={styles.tabWrapper} testID="view_UTXOSelectTotal">
      <Box style={styles.selectionWrapper}>
        <Text style={styles.selectionText}>{`${selectedUTXOs.length} UTXO Selected`}</Text>
      </Box>
      <Box style={styles.totalWrapper}>
        <Text style={styles.selectionTotalText}>Total</Text>
        <Box>{getCurrencyImageByRegion(currencyCode, 'dark', currentCurrency, BtcBlack)}</Box>
        <Text style={styles.selectionText} testID="text_selectionTotal">
          {getAmt(selectionTotal, exchangeRates, currencyCode, currentCurrency, satsEnabled)}
          <Text color={`${colorMode}.dateText`} style={styles.selectionText}>
            {getUnit(currentCurrency, satsEnabled)}
          </Text>
        </Text>
      </Box>
    </Box>
  );
}
const styles = StyleSheet.create({
  tabWrapper: {
    flexDirection: 'row',
    padding: 12,
    marginTop: hp(20),
    width: '100%',
  },
  selectionWrapper: {
    width: '48%',
  },
  totalWrapper: {
    flexDirection: 'row',
    width: '48%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  totalView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionText: {
    fontSize: 16,
    fontWeight: '400',
    paddingLeft: 5,
  },
  selectionTotalText: {
    fontSize: 16,
    marginRight: 10,
    fontWeight: '400',
  },
});
export default UTXOSelectionTotal;
