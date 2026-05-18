import {
  UTXO,
  UTXOInfo,
  UTXOSpendabilityReason,
  UTXOSpendabilityStatus,
} from '../interfaces';
import { AddressReceiveMetadata } from '../interfaces/wallet';

export const DUST_THRESHOLD_SATS = 5000;
export const MIN_DONATE_DUST_FEE_RATE = 1;
export const DONATE_DUST_DESTINATION = 'bc1qyqequr0824nwf7snzvq5gqsr6xscn62e3ttm06';
export const DONATE_DUST_UNBUILDABLE_ERROR =
  'These coins are too small to donate on their own. Keeper will keep them marked Do Not Spend.';

export const getUTXOId = ({ txId, vout }: Pick<UTXO, 'txId' | 'vout'>) => `${txId}:${vout}`;

export const filterSpendableUTXOs = (spendabilityMap: Map<string, UTXOInfo>, utxos: UTXO[]) =>
  utxos.filter((utxo) => {
    const record = spendabilityMap.get(getUTXOId(utxo));
    return !record || record.spendabilityStatus !== UTXOSpendabilityStatus.DO_NOT_SPEND;
  });

export const getDoNotSpendUTXOs = (spendabilityMap: Map<string, UTXOInfo>, utxos: UTXO[]) =>
  utxos.filter((utxo) => {
    const record = spendabilityMap.get(getUTXOId(utxo));
    return record?.spendabilityStatus === UTXOSpendabilityStatus.DO_NOT_SPEND;
  });

export const hasDoNotSpendUTXOs = (spendabilityMap: Map<string, UTXOInfo>, utxos: UTXO[]) =>
  getDoNotSpendUTXOs(spendabilityMap, utxos).length > 0;

export const getSpendableBalance = (spendabilityMap: Map<string, UTXOInfo>, utxos: UTXO[]) =>
  filterSpendableUTXOs(spendabilityMap, utxos).reduce((sum, utxo) => sum + utxo.value, 0);

export const getTotalBalance = (utxos: UTXO[]) => utxos.reduce((sum, utxo) => sum + utxo.value, 0);

export const normalizeAddressReceiveMetadata = (
  metadata?: Partial<AddressReceiveMetadata>
): AddressReceiveMetadata => ({
  highestReceivedReceiveAddressIndex:
    typeof metadata?.highestReceivedReceiveAddressIndex === 'number'
      ? metadata.highestReceivedReceiveAddressIndex
      : -1,
  receiveAddressReceiveCount: metadata?.receiveAddressReceiveCount || {},
  changeAddressReceiveCount: metadata?.changeAddressReceiveCount || {},
});

export const updateAddressReceiveMetadata = ({
  metadata,
  externalAddresses,
  internalAddresses,
  utxosByAddress,
}: {
  metadata?: Partial<AddressReceiveMetadata>;
  externalAddresses: { [address: string]: number };
  internalAddresses: { [address: string]: number };
  utxosByAddress: { [address: string]: UTXO[] };
}): AddressReceiveMetadata => {
  const normalized = normalizeAddressReceiveMetadata(metadata);

  for (const address in utxosByAddress) {
    const receivedCount = utxosByAddress[address]?.length || 0;
    if (receivedCount <= 0) continue;

    if (externalAddresses[address] !== undefined) {
      normalized.receiveAddressReceiveCount[address] = receivedCount;
      if (externalAddresses[address] > normalized.highestReceivedReceiveAddressIndex) {
        normalized.highestReceivedReceiveAddressIndex = externalAddresses[address];
      }
      continue;
    }

    if (internalAddresses[address] !== undefined) {
      normalized.changeAddressReceiveCount[address] = receivedCount;
    }
  }

  return normalized;
};

export const classifyUTXOForDust = ({
  utxo,
  externalAddresses,
  internalAddresses,
  addressReceiveMetadata,
}: {
  utxo: UTXO;
  externalAddresses: { [address: string]: number };
  internalAddresses: { [address: string]: number };
  addressReceiveMetadata?: Partial<AddressReceiveMetadata>;
}): {
  spendabilityStatus: UTXOSpendabilityStatus;
  spendabilityReason?: UTXOSpendabilityReason;
} => {
  if (utxo.value >= DUST_THRESHOLD_SATS) {
    return { spendabilityStatus: UTXOSpendabilityStatus.SPENDABLE };
  }

  const metadata = normalizeAddressReceiveMetadata(addressReceiveMetadata);

  const receiveIndex = externalAddresses[utxo.address];
  if (receiveIndex !== undefined) {
    const receiveCount = metadata.receiveAddressReceiveCount[utxo.address] || 0;
    const isReceiveAddressReused = receiveCount > 1;
    const isReceiveAddressOutOfOrder =
      receiveIndex < metadata.highestReceivedReceiveAddressIndex;

    if (isReceiveAddressReused || isReceiveAddressOutOfOrder) {
      return {
        spendabilityStatus: UTXOSpendabilityStatus.DO_NOT_SPEND,
        spendabilityReason: UTXOSpendabilityReason.POTENTIAL_DUST_PAYMENT,
      };
    }
  }

  const changeIndex = internalAddresses[utxo.address];
  if (changeIndex !== undefined) {
    const changeCount = metadata.changeAddressReceiveCount[utxo.address] || 0;
    if (changeCount > 1) {
      return {
        spendabilityStatus: UTXOSpendabilityStatus.DO_NOT_SPEND,
        spendabilityReason: UTXOSpendabilityReason.POTENTIAL_DUST_PAYMENT,
      };
    }
  }

  return { spendabilityStatus: UTXOSpendabilityStatus.SPENDABLE };
};
