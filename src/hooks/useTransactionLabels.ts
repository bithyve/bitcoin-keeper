import { useQuery } from '@realm/react';
import { EntityKind } from 'src/services/wallets/enums';
import { RealmSchema } from 'src/storage/realm/enum';

const useTransactionLabels = ({ txid, wallet }) => {
  const Tags = useQuery(RealmSchema.Tags);
  const isVault = wallet.entityKind === EntityKind.VAULT;
  const txLabels = Tags.filtered(`ref == '${txid}'`);
  let labels = txLabels.map((tag) => ({ name: tag.label, isSystem: tag.isSystem }));
  if (!isVault) {
    labels.push({ name: wallet.presentationData.name, isSystem: true });
  }
  labels = labels.sort((a, b) => (a.isSystem === b.isSystem ? 0 : a.isSystem ? -1 : 1));
  return { labels } as { labels: { name: string; isSystem: boolean }[] };
};

export default useTransactionLabels;
