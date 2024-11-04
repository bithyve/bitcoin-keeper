/* eslint-disable react-hooks/rules-of-hooks */
import { useContext, useMemo } from 'react';
import { UTXO, UTXOInfo } from 'src/services/wallets/interfaces';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { EntityKind, LabelType, WalletType } from 'src/services/wallets/enums';
import { Vault } from 'src/services/wallets/interfaces/vault';
import { useDispatch } from 'react-redux';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import { useQuery } from '@realm/react';

const useLabels = ({ utxos, wallet }: { utxos: UTXO[]; wallet: Wallet | Vault }) => {
  if (!wallet) return { labels: [], syncing: false };
  const utxoInfoTable = useQuery(RealmSchema.UTXOInfo);
  const Schema = wallet.entityKind === EntityKind.WALLET ? RealmSchema.Wallet : RealmSchema.Vault;
  const wallets = useQuery(Schema);

  const dispatch = useDispatch();
  const isWhirlpoolWallet =
    wallet.type === WalletType.PRE_MIX ||
    wallet.type === WalletType.POST_MIX ||
    wallet.type === WalletType.BAD_BANK;
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

        if (isWhirlpoolWallet) {
          // add the wallet label and the whirlpool label for whirlpool wallets
          const parentWallet = wallets
            .filtered(`id == "${wallet.depositWalletId}"`)
            .map(getJSONFromRealmObject)[0];
          utxoLabels.push({
            name: wallet.presentationData.name.replace('Wallet', '').trim(),
            type: LabelType.SYSTEM,
          });
          utxoLabels.push({
            name: parentWallet.presentationData.name,
            type: LabelType.SYSTEM,
          });
        } else {
          // add only the wallet label for non-whirlpool wallets
          // utxoLabels.push({
          //   name: wallet.presentationData.name,
          //   type: LabelType.SYSTEM,
          // });
          // workaround for deposit wallet as it's the default wallet and not a whirlpool wallet
          if (wallet.type === WalletType.DEFAULT) {
            utxoLabels.push({
              name: 'DEPOSIT',
              type: LabelType.SYSTEM,
            });
          }
        }

        labels[labelId] = utxoLabels;
      } else {
        dispatch(refreshWallets([wallet], { hardRefresh: true }));
      }
    });
    return labels;
  }, [utxos, utxoInfoTable]);

  return { labels };
};

export default useLabels;
