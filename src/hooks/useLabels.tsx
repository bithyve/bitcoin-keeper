import { useContext, useMemo } from 'react';
import { UTXO, UTXOInfo } from 'src/core/wallets/interfaces';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { EntityKind, LabelType } from 'src/core/wallets/enums';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { refreshWallets } from 'src/store/sagaActions/wallets';

const useLabels = ({ utxos, wallet }: { utxos: UTXO[]; wallet: Wallet | Vault }) => {
  const { useQuery } = useContext(RealmWrapperContext);
  const utxoInfoTable = useQuery(RealmSchema.UTXOInfo);
  const Schema = wallet.entityKind === EntityKind.WALLET ? RealmSchema.Wallet : RealmSchema.Vault;
  const wallets = useQuery(Schema);
  const { syncing } = useAppSelector((state) => state.wallet);
  const dispatch = useDispatch();

  const labels = useMemo(() => {
    const labels = {};
    utxos.forEach((utxo) => {
      const labelId = `${utxo.txId}${utxo.vout}`;
      const utxoInfo: UTXOInfo = utxoInfoTable
        .filtered(`id == "${labelId}"`)
        .map(getJSONFromRealmObject)[0];
      if (utxoInfo) {
        const utxoLabels = utxoInfo.labels;
        const wallet: Wallet | Vault = wallets
          .filtered(`id == "${utxoInfo.walletId}"`)
          .map(getJSONFromRealmObject)[0];
        utxoLabels.push({ name: wallet.presentationData.name, type: LabelType.SYSTEM });
        labels[labelId] = utxoLabels;
      } else {
        dispatch(refreshWallets([wallet], { hardRefresh: true }));
      }
    });
    return labels;
  }, [utxos, utxoInfoTable]);

  return { labels, syncing };
};

export default useLabels;
