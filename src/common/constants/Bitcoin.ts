import config from 'src/core/config'
import { NetworkType } from 'src/core/wallets/enums'

export const SATOSHIS_IN_BTC = 1e8

export const getAmount = (amountInSats: number) => {
  if (config.NETWORK_TYPE === NetworkType.MAINNET) {
    return (amountInSats / SATOSHIS_IN_BTC).toFixed(4);
  } else {
    return amountInSats;
  }
}
