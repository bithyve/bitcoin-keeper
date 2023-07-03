import { useContext } from 'react';
import { EntityKind, WalletType } from 'src/core/wallets/enums';
import { UTXO } from 'src/core/wallets/interfaces';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';

const useLabelsNew = ({
  txid,
  utxos,
  wallet,
}: {
  txid?: string;
  utxos?: UTXO[];
  wallet: Wallet | Vault;
}) => {
  const { useQuery } = useContext(RealmWrapperContext);
  const Schema = wallet.entityKind === EntityKind.WALLET ? RealmSchema.Wallet : RealmSchema.Vault;
  const wallets = useQuery(Schema);

  const Tags = useQuery(RealmSchema.Tags);
  const utxoMap = {};
  const labelMap = {};

  if (txid) {
    utxoMap[txid] = true;
    labelMap[txid] = [];
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

  // plug system labels only for utxos
  if (!txid) {
    const isWhirlpoolWallet =
      wallet.type === WalletType.PRE_MIX ||
      wallet.type === WalletType.POST_MIX ||
      wallet.type === WalletType.BAD_BANK;

    Object.keys(labelMap).forEach((key) => {
      if (isWhirlpoolWallet) {
        const parentWallet = wallets
          .filtered(`id == "${wallet.depositWalletId}"`)
          .map(getJSONFromRealmObject)[0];
        labelMap[key].push({ name: parentWallet.presentationData.name, isSystem: true });
        labelMap[key].push({
          name: wallet.presentationData.name.replace('Wallet', '').trim(),
          isSystem: true,
        });
      } else {
        labelMap[key].push({ name: wallet.presentationData.name, isSystem: true });
        labelMap[key].push({ name: 'DEPOSIT', isSystem: true });
      }
    });
  }

  return { labels: labelMap };
};

export default useLabelsNew;
