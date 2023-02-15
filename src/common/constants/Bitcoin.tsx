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
import Dolar from 'src/assets/images/icon_dollar.svg';
import CurrencyKind from '../data/enums/CurrencyKind';

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

export const getAmount = (amountInSats: number) => {
  // config.NETWORK_TYPE === NetworkType.MAINNET    disable sats mode

  if (amountInSats !== 0) {
    if (amountInSats > 99) {
      return amountInSats / SATOSHIS_IN_BTC;
    }
    return (amountInSats / SATOSHIS_IN_BTC).toFixed(6);
  }
  return numberWithCommas(amountInSats);
};

const numberWithCommas = (x) => (x ? x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : 0);

export const getAmt = (amountInSats: number, exchangeRates, currencyCode, currentCurrency) => {
  if (currentCurrency === CurrencyKind.BITCOIN) {
    return getAmount(amountInSats);
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

export const getUnit = (currentCurrency) => {
  const isBitcoin = currentCurrency === CurrencyKind.BITCOIN;
  // disable sats mode
  if (isBitcoin && config.NETWORK_TYPE === NetworkType.TESTNET && false) {
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

export const getCurrencyImageByRegion = (
  currencyCode: string,
  type: 'light' | 'green' | 'dark',
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
  // These currencies also use the $ symbol although the currency is Peso 'MXN', 'COP', 'CLP', 'UYU', 'DOP', 'ARS'

  // const poundCurrency = ['EGP', 'FKP', 'GIP', 'GGP', 'IMP', 'JEP', 'SHP', 'SYP', 'GBP'];

  if (currentCurrency !== CurrencyKind.BITCOIN && dollarCurrency.includes(currencyCode)) {
    if (type === 'light') {
      return <DolarWhite />;
    }
    if (type === 'green') {
      return <DolarGreen />;
    }
    if (type === 'dark') {
      return <Dolar />;
    }
  } else {
    return <BTCIcon />;
  }

  // using Dolar for now

  // if (poundCurrency.includes(currencyCode)) {
  //   if (type === 'light') {
  //     return require('../../assets/images/currencySymbols/icon_pound_white.png')
  //   } else if (type === 'dark') {
  //     return require('../../assets/images/currencySymbols/icon_pound_dark.png')
  //   } else if (type === 'gray') {
  //     return require('../../assets/images/currencySymbols/icon_pound_gray.png')
  //   } else if (type === 'light_blue') {
  //     return require('../../assets/images/currencySymbols/icon_pound_lightblue.png')
  //   }
  //   return require('../../assets/images/currencySymbols/icon_pound_white.png')
  // }

  // if (currencyCode === 'DKK' || currencyCode === 'ISK' || currencyCode === 'SEK') {
  //   if (type === 'light') {
  //     return require('../../assets/images/currencySymbols/icon_kr_white.png')
  //   } else if (type === 'dark') {
  //     return require('../../assets/images/currencySymbols/icon_kr_dark.png')
  //   } else if (type === 'gray') {
  //     return require('../../assets/images/currencySymbols/icon_kr_gray.png')
  //   } else if (type === 'light_blue') {
  //     return require('../../assets/images/currencySymbols/icon_kr_lightblue.png')
  //   }
  //   return require('../../assets/images/currencySymbols/icon_kr_gray.png')
  // }

  // if (currencyCode === 'PLN') {
  //   if (type === 'light') {
  //     return require('../../assets/images/currencySymbols/icon_pln_white.png')
  //   } else if (type === 'dark') {
  //     return require('../../assets/images/currencySymbols/icon_pln_dark.png')
  //   } else if (type === 'gray') {
  //     return require('../../assets/images/currencySymbols/icon_pln_gray.png')
  //   } else if (type === 'light_blue') {
  //     return require('../../assets/images/currencySymbols/icon_pln_lightblue.png')
  //   }
  //   return require('../../assets/images/currencySymbols/icon_pln_gray.png')
  // }

  // if (currencyCode === 'THB') {
  //   if (type === 'light') {
  //     return require('../../assets/images/currencySymbols/icon_thb_white.png')
  //   } else if (type === 'dark') {
  //     return require('../../assets/images/currencySymbols/icon_thb_dark.png')
  //   } else if (type === 'gray') {
  //     return require('../../assets/images/currencySymbols/icon_thb_gray.png')
  //   } else if (type === 'light_blue') {
  //     return require('../../assets/images/currencySymbols/icon_thb_lightblue.png')
  //   }
  //   return require('../../assets/images/currencySymbols/icon_thb_gray.png')
  // }

  // if (currencyCode === 'CHF') {
  //   if (type === 'light') {
  //     return require('../../assets/images/currencySymbols/icon_chf_white.png')
  //   } else if (type === 'dark') {
  //     return require('../../assets/images/currencySymbols/icon_chf_dark.png')
  //   } else if (type === 'gray') {
  //     return require('../../assets/images/currencySymbols/icon_chf_gray.png')
  //   } else if (type === 'light_blue') {
  //     return require('../../assets/images/currencySymbols/icon_chf_lightblue.png')
  //   }
  //   return require('../../assets/images/currencySymbols/icon_chf_gray.png')
  // }
};
