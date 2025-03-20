import { useQuery } from '@realm/react';
import { UTXO } from 'src/services/wallets/interfaces';
import { RealmSchema } from 'src/storage/realm/enum';

const useLabelsNew = ({
  txid,
  address,
  utxos = [],
}: {
  txid?: string;
  address?: string;
  utxos?: UTXO[];
}) => {
  const Tags = useQuery(RealmSchema.Tags);
  const utxoMap = {};
  const labelMap = {};

  if (txid) {
    utxoMap[txid] = true;
    labelMap[txid] = [];
  } else if (address) {
    utxoMap[address] = true;
    labelMap[address] = [];
  } else {
    utxos.forEach(({ txId, vout }) => {
      utxoMap[`${txId}:${vout}`] = true;
      labelMap[`${txId}:${vout}`] = [];
    });
  }

  Tags.forEach((tag) => {
    if (utxoMap[tag.ref]) {
      labelMap[tag.ref].push({ name: tag.label, isSystem: tag.isSystem });
    }
  });

  return { labels: labelMap };
};

export default useLabelsNew;
