import Scale from 'src/components/Scale';
import config from 'src/utils/service-utilities/config';
import { NetworkType } from 'src/services/wallets/enums';
import BTC from 'src/assets/images/btc_white.svg';
import { HStack, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import React from 'react';
import Colors from 'src/theme/Colors';
import CurrencyKind from '../models/enums/CurrencyKind';
import FiatCurrencies from './FiatCurrencies';

export const SATOSHIS_IN_BTC = 1e8;

export const BtcToSats = (amountInBtc: number) => {
  if (amountInBtc !== 0) {
    return (amountInBtc * SATOSHIS_IN_BTC).toFixed(0);
  }
  return amountInBtc;
};

export const SatsToBtc = (amountInSats: number) => {
  if (amountInSats !== 0) {
    if (amountInSats > 99) {
      return amountInSats / SATOSHIS_IN_BTC;
    }
    return (amountInSats / SATOSHIS_IN_BTC).toFixed(6);
  }
  return amountInSats;
};

export const getAmount = (amountInSats: number, satsEnabled = false) => {
  // config.NETWORK_TYPE === NetworkType.MAINNET    disable sats mode

  if (satsEnabled === false && amountInSats !== 0) {
    if (amountInSats > 99) {
      return amountInSats / SATOSHIS_IN_BTC;
    }
    return (amountInSats / SATOSHIS_IN_BTC).toFixed(6);
  }
  return numberWithCommas(amountInSats);
};

const numberWithCommas = (x) => (x ? x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : 0);

export const getAmt = (
  amountInSats: number,
  exchangeRates,
  currencyCode,
  currentCurrency,
  satsEnabled = false
) => {
  if (currentCurrency === CurrencyKind.BITCOIN) {
    return getAmount(amountInSats, satsEnabled);
  }
  if (exchangeRates && exchangeRates[currencyCode]) {
    return ((exchangeRates[currencyCode].last / SATOSHIS_IN_BTC) * amountInSats).toFixed(2);
  }
  return numberWithCommas(amountInSats);
};

export const getConvertedAmt = (
  amount: number,
  exchangeRates,
  currencyCode,
  currentCurrency,
  satsEnabled = false
) => {
  if (amount) {
    if (currentCurrency === CurrencyKind.BITCOIN) {
      if (satsEnabled) {
        return ((SATOSHIS_IN_BTC / exchangeRates[currencyCode].last) * amount).toFixed(2);
      }
      return (amount / exchangeRates[currencyCode].last).toFixed(5);
    }
    if (exchangeRates && exchangeRates[currencyCode]) {
      if (satsEnabled) {
        return ((amount / SATOSHIS_IN_BTC) * exchangeRates[currencyCode].last).toFixed(2);
      }
      return (exchangeRates[currencyCode].last * amount).toFixed(2);
    }
    return numberWithCommas(amount);
  }
  return null;
};

export const NetworkAmount = (
  amountInSats: number,
  exchangeRates,
  currencyCode,
  currentCurrency,
  textStyles = [{}],
  scale = 1
) => {
  const { colorMode } = useColorMode();
  let text: string;
  if (isTestnet()) {
    text = `${amountInSats}`;
  } else {
    text = (amountInSats / SATOSHIS_IN_BTC).toFixed(4);
  }
  text = getAmt(amountInSats, exchangeRates, currencyCode, currentCurrency);
  return (
    <HStack alignItems="center">
      {!isTestnet() ? (
        <Scale scale={scale}>
          {getCurrencyImageByRegion(currencyCode, 'light', currentCurrency, BTC)}
        </Scale>
      ) : null}
      <Text color={`${colorMode}.white`} style={textStyles}>
        {text}
        <Text style={{ fontSize: 12 }}> {getUnit(currentCurrency)}</Text>
      </Text>
    </HStack>
  );
};

export const getUnit = (currentCurrency, satsEnabled = false) => {
  const isBitcoin = currentCurrency === CurrencyKind.BITCOIN;
  // disable sats mode
  if (isBitcoin && config.NETWORK_TYPE === NetworkType.TESTNET && satsEnabled) {
    return 'sats';
  }
  return '';
};

export const isTestnet = () => {
  if (config.NETWORK_TYPE === NetworkType.TESTNET) {
    return true;
  }
  return false;
};
export function CurrencyIcon({ symbol, styles = {} }) {
  return (
    <Text
      style={{
        ...styles,
        fontSize: 14,
        letterSpacing: 0.5,
        fontWeight: '900',
        lineHeight: 18,
      }}
      bold
    >
      {symbol}
    </Text>
  );
}

export const getCurrencyImageByRegion = (
  currencyCode: string,
  type: 'light' | 'green' | 'dark' | 'grey' | 'slateGreen',
  currentCurrency: CurrencyKind,
  BTCIcon: any
) => {
  const styles = {} as any;
  switch (type) {
    case 'light':
      styles.color = Colors.White;
      break;
    case 'green':
      styles.color = Colors.GenericViridian;
      break;
    case 'dark':
      styles.color = Colors.RichGreen;
      break;
    case 'grey':
      styles.color = Colors.White;
      styles.opacity = 0.7;
      break;
    case 'slateGreen':
      styles.color = Colors.SlateGreen;
      break;
    default:
      styles.color = Colors.White;
  }
  if (currentCurrency !== CurrencyKind.BITCOIN) {
    const currency = FiatCurrencies.find((c) => c.code === currencyCode);
    if (currency) {
      return <CurrencyIcon styles={styles} symbol={currency.symbol} />;
    }
    return null;
  }
  return <BTCIcon style={{ color: styles.color }} />;
};

export const getFiatIcon = (currencyCode: string, type: 'light' | 'green' | 'dark' | 'grey') => {
  const currency = FiatCurrencies.find((c) => c.code === currencyCode);
  const styles = {} as any;
  switch (type) {
    case 'light':
      styles.color = Colors.White;
      break;
    case 'green':
      styles.color = Colors.GenericViridian;
      break;
    case 'dark':
      styles.color = Colors.RichGreen;
      break;
    case 'grey':
      styles.color = Colors.White;
      styles.opacity = 0.7;
      break;
    default:
      styles.color = Colors.White;
  }
  if (currency) {
    return <CurrencyIcon styles={styles} symbol={currency.symbol} />;
  }
  return null;
};
