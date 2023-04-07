import Scale from 'src/components/Scale';
import config from 'src/core/config';
import { NetworkType } from 'src/core/wallets/enums';
import BTC from 'src/assets/images/btc_white.svg';
import { HStack } from 'native-base';
import Text from 'src/components/KeeperText';
import React from 'react';
// asserts
import DolarWhite from 'src/assets/images/icon_dollar_white.svg';
import DolarGreen from 'src/assets/images/icon_dollar_green.svg';
import DolarGrey from 'src/assets/images/icon_dollar_grey.svg';
import Dolar from 'src/assets/images/icon_dollar.svg';
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
export const Dollar = ({ color }) => {
  return (
    <Text
      style={{
        fontSize: 12,
        color: color,
        letterSpacing: 0.5,
        fontWeight: '900',
        lineHeight: 18,
      }}
    >
      $
    </Text>
  );
};

export const getCurrencyImageByRegion = (
  currencyCode: string,
  type: 'light' | 'green' | 'dark' | 'grey',
  currentCurrency: CurrencyKind,
  BTCIcon: any
) => {
  const dollarCurrency = [
    'USD',
    'AUD',
    'BBD',
    'BSD',
    'BZD',
    'BMD',
    'BND',
    'KHR',
    'CAD',
    'KYD',
    'XCD',
    'FJD',
    'GYD',
    'HKD',
    'JMD',
    'LRD',
    'NAD',
    'NZD',
    'SGD',
    'SBD',
    'SRD',
    'TWD',
    'USH',
    'TTD',
    'TVD',
    'ZWD',
    'MXN',
    'COP',
    'CLP',
    'UYU',
    'DOP',
    'ARS',
  ];

  if (currentCurrency !== CurrencyKind.BITCOIN && dollarCurrency.includes(currencyCode)) {
    if (type === 'light') {
      return <DolarWhite />;
      // return <Dollar color={Colors.White} />;
    }
    if (type === 'green') {
      return <DolarGreen />;
      // return <Dollar color={Colors.GenericViridian} />;
    }
    if (type === 'grey') {
      return <DolarGrey />;
    }
    if (type === 'dark') {
      return <Dolar />;
      // return <Dollar color={Colors.RichGreen} />;
    }
  } else {
    return <BTCIcon />;
  }
};
