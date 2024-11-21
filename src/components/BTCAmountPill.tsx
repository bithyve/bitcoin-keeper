import React from 'react';
import { Box, useColorMode } from 'native-base';
import Text from './KeeperText';
import useExchangeRates from 'src/hooks/useExchangeRates';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import BTCMidnight from 'src/assets/images/BTC-midnight.svg';
import BTCcream from 'src/assets/images/BTC-cream.svg';
import { formatNumber } from 'src/utils/utilities';
import { StyleSheet } from 'react-native';
import { wp } from 'src/constants/responsive';

const BTCAmountPill = () => {
  const { colorMode } = useColorMode();
  const exchangeRates = useExchangeRates();
  const currencyCode = useCurrencyCode();
  const currencyCodeExchangeRate = exchangeRates[currencyCode];
  const isDarkMode = colorMode === 'dark';
  const BTCIcon = isDarkMode ? BTCcream : BTCMidnight;

  return (
    <Box style={styles.pillContainer} backgroundColor={`${colorMode}.btcLabelBack`}>
      <BTCIcon isDarkMode={isDarkMode} />
      <Text
        bold
        color={`${colorMode}.btcPillText`}
        style={styles.heading}
        testID="text_Transaction"
      >
        {` = ${currencyCodeExchangeRate.symbol} ${formatNumber(
          currencyCodeExchangeRate.buy.toFixed(0)
        )}`}
      </Text>
    </Box>
  );
};

const styles = StyleSheet.create({
  pillContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(7),
    height: 17,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 10,
    lineHeight: 18,
  },
});

export default BTCAmountPill;
