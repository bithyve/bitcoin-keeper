import Scale from 'src/components/Scale';
import config from 'src/core/config';
import { NetworkType } from 'src/core/wallets/enums';
import BTC from 'src/assets/images/btc_white.svg';
import { HStack } from 'native-base';
import Text from 'src/components/KeeperText';
import React from 'react';
// asserts
import CurrencyKind from '../data/enums/CurrencyKind';
import Colors from 'src/theme/Colors';

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

export const getNetworkAmount = (
  amountInSats: number,
  exchangeRates,
  currencyCode,
  currentCurrency,
  textStyles = [{}],
  scale = 1
) => {
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
      <Text color="light.white" style={textStyles}>
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
export const CurrencyIcon = ({ color, symbol, style = {} }) => {
  return (
    <Text
      style={{
        ...style,
        fontSize: 14,
        color: color,
        letterSpacing: 0.5,
        fontWeight: '900',
        lineHeight: 18,
      }}
      bold
    >
      {symbol}
    </Text>
  );
};

export const getCurrencyImageByRegion = (
  currencyCode: string,
  type: 'light' | 'green' | 'dark' | 'grey',
  currentCurrency: CurrencyKind,
  BTCIcon: any
) => {

  const dollarCurrency = ['USD', 'AUD', 'BBD', 'BSD', 'BZD', 'BMD', 'BND', 'KHR', 'CAD', 'KYD', 'XCD', 'FJD', 'GYD', 'HKD', 'JMD', 'LRD', 'NAD', 'NZD', 'SGD', 'SBD', 'SRD', 'TWD', 'USH', 'TTD', 'TVD', 'ZWD', 'MXN', 'COP', 'CLP', 'UYU', 'DOP', 'ARS']

  const poundCurrency = ['EGP', 'FKP', 'GIP', 'GGP', 'IMP', 'JEP', 'SHP', 'SYP', 'GBP']

  if (currentCurrency !== CurrencyKind.BITCOIN) {

    if (dollarCurrency.includes(currencyCode)) {
      if (type === 'light') {
        return <CurrencyIcon color={Colors.White} symbol={'$'} />;
      }
      if (type === 'green') {
        return <CurrencyIcon color={Colors.GenericViridian} symbol={'$'} />;
      }
      if (type === 'grey') {
        return <CurrencyIcon color={Colors.PearlGrey} symbol={'$'} style={{ opacity: 0.7 }} />;
      }
      if (type === 'dark') {
        return <CurrencyIcon color={Colors.RichGreen} symbol={'$'} />;
      }
    }

    if (poundCurrency.includes(currencyCode)) {
      if (type === 'light') {
        return <CurrencyIcon color={Colors.White} symbol={'£'} />;
      }
      if (type === 'green') {
        return <CurrencyIcon color={Colors.GenericViridian} symbol={'£'} />;
      }
      if (type === 'grey') {
        return <CurrencyIcon color={Colors.PearlGrey} symbol={'£'} style={{ opacity: 0.7 }} />;
      }
      if (type === 'dark') {
        return <CurrencyIcon color={Colors.RichGreen} symbol={'£'} />;
      }
    }

    if (currencyCode == 'DKK' || currencyCode == 'ISK' || currencyCode == 'SEK') {
      if (type === 'light') {
        return <CurrencyIcon color={Colors.White} symbol={'kr'} />;
      }
      if (type === 'green') {
        return <CurrencyIcon color={Colors.GenericViridian} symbol={'kr'} />;
      }
      if (type === 'grey') {
        return <CurrencyIcon color={Colors.PearlGrey} symbol={'kr'} style={{ opacity: 0.7 }} />;
      }
      if (type === 'dark') {
        return <CurrencyIcon color={Colors.RichGreen} symbol={'kr'} />;
      }
    }

    if (currencyCode == 'PLN') {
      if (type === 'light') {
        return <CurrencyIcon color={Colors.White} symbol={'zł'} />;
      }
      if (type === 'green') {
        return <CurrencyIcon color={Colors.GenericViridian} symbol={'zł'} />;
      }
      if (type === 'grey') {
        return <CurrencyIcon color={Colors.PearlGrey} symbol={'zł'} style={{ opacity: 0.7 }} />;
      }
      if (type === 'dark') {
        return <CurrencyIcon color={Colors.RichGreen} symbol={'zł'} />;
      }
    }

    if (currencyCode == 'THB') {
      if (type === 'light') {
        return <CurrencyIcon color={Colors.White} symbol={'฿'} />;
      }
      if (type === 'green') {
        return <CurrencyIcon color={Colors.GenericViridian} symbol={'฿'} />;
      }
      if (type === 'grey') {
        return <CurrencyIcon color={Colors.PearlGrey} symbol={'฿'} style={{ opacity: 0.7 }} />;
      }
      if (type === 'dark') {
        return <CurrencyIcon color={Colors.RichGreen} symbol={'฿'} />;
      }
    }

    if (currencyCode == 'CHF') {
      if (type === 'light') {
        return <CurrencyIcon color={Colors.White} symbol={'CHF'} />;
      }
      if (type === 'green') {
        return <CurrencyIcon color={Colors.GenericViridian} symbol={'CHF'} />;
      }
      if (type === 'grey') {
        return <CurrencyIcon color={Colors.PearlGrey} symbol={'CHF'} style={{ opacity: 0.7 }} />;
      }
      if (type === 'dark') {
        return <CurrencyIcon color={Colors.RichGreen} symbol={'CHF'} />;
      }
    }
  } else {
    return <BTCIcon />;
  }
};
