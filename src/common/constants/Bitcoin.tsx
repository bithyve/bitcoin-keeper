import Scale from 'src/components/Scale';
import config from 'src/core/config';
import { NetworkType } from 'src/core/wallets/enums';
import BTC from 'src/assets/images/btc_white.svg';
import { HStack } from 'native-base';
import Text from 'src/components/KeeperText';
import React from 'react';

export const SATOSHIS_IN_BTC = 1e8;

export const getAmount = (amountInSats: number) => {
  if (config.NETWORK_TYPE === NetworkType.MAINNET) {
    return (amountInSats / SATOSHIS_IN_BTC).toFixed(4);
  }
  return amountInSats;
};

export const getNetworkAmount = (amountInSats: number, textStyles = [{}], scale = 1) => {
  let text: string;
  if (isTestnet()) {
    text = `${amountInSats}`;
  } else {
    text = (amountInSats / SATOSHIS_IN_BTC).toFixed(4);
  }
  return (
    <HStack alignItems="center">
      {!isTestnet() ? (
        <Scale scale={scale}>
          <BTC />
        </Scale>
      ) : null}
      <Text color="light.white" style={textStyles}>
        {text}
        <Text style={{ fontSize: 12 }}> sats</Text>
      </Text>
    </HStack>
  );
};

export const getUnit = () => {
  if (config.NETWORK_TYPE === NetworkType.MAINNET) {
    return '';
  }
  return 'sats';
};

export const isTestnet = () => {
  if (config.NETWORK_TYPE === NetworkType.TESTNET) {
    return true;
  }
  return false;
};
