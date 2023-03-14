import { useContext, useEffect, useState } from 'react';
import { UTXO, UTXOInfo } from 'src/core/wallets/interfaces';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { LabelType } from 'src/core/wallets/enums';

const useLabels = ({ utxos }: { utxos: UTXO[] }) => {
  const [labels, setLabels] = useState<any>(null);
  const { useQuery } = useContext(RealmWrapperContext);
  const utxoInfoTable = useQuery(RealmSchema.UTXOInfo);
  const wallets = useQuery(RealmSchema.Wallet);
  useEffect(() => {
    const labels = {};
    utxos.forEach((utxo) => {
      const labelId = `${utxo.txId}${utxo.vout}`;
      const utxoInfo: UTXOInfo = utxoInfoTable
        .filtered(`id == "${labelId}"`)
        .map(getJSONFromRealmObject)[0];
      const utxoLabels = utxoInfo.labels;
      const wallet: Wallet = wallets
        .filtered(`id == "${utxoInfo.walletId}"`)
        .map(getJSONFromRealmObject)[0];
      utxoLabels.push({ name: wallet.presentationData.name, type: LabelType.SYSTEM });
      labels[labelId] = utxoLabels;
    });
    setLabels(labels);
  }, [utxos]);
  return { labels };
};

export default useLabels;
