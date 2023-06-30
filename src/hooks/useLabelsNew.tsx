import { useContext } from 'react';
import { WalletType } from 'src/core/wallets/enums';
import { UTXO } from 'src/core/wallets/interfaces';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { RealmSchema } from 'src/storage/realm/enum';

const useLabelsNew = ({ utxos, wallet }: { utxos: UTXO[]; wallet: Wallet }) => {
  const { useQuery } = useContext(RealmWrapperContext);
  const Tags = useQuery(RealmSchema.Tags);
  const utxoMap = {};
  const labelMap = {};

  utxos.forEach(({ txId, vout }) => {
    utxoMap[`${txId}:${vout}`] = true;
    labelMap[`${txId}:${vout}`] = [];
  });

  Tags.forEach((tag) => {
    if (utxoMap[tag.ref]) {
      labelMap[tag.ref].push({ name: tag.label, isSystem: tag.isSystem });
    }
  });

  const isWhirlpoolWallet =
    wallet.type === WalletType.PRE_MIX ||
    wallet.type === WalletType.POST_MIX ||
    wallet.type === WalletType.BAD_BANK;

  Object.keys(labelMap).forEach((key) => {
    labelMap[key].push({ name: wallet.presentationData.name, isSystem: true });
    if (isWhirlpoolWallet) {
      labelMap[key].push({
        name: wallet.presentationData.name.replace('Wallet', '').trim(),
        isSystem: true,
      });
    } else {
      labelMap[key].push({ name: 'DEPOSIT', isSystem: true });
    }
  });

  return { labels: labelMap };
};

export default useLabelsNew;
