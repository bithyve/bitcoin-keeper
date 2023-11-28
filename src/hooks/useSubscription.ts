import { useQuery } from '@realm/react';
import { SignerType } from 'src/core/wallets/enums';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';

const useSubscription = () => {
  const keeper: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  const L1Signers = [
    SignerType.TAPSIGNER,
    SignerType.KEEPER,
    SignerType.TREZOR,
    SignerType.LEDGER,
    SignerType.COLDCARD,
    SignerType.PASSPORT,
    SignerType.JADE,
    SignerType.KEYSTONE,
    SignerType.MOBILE_KEY,
    SignerType.SEED_WORDS,
    SignerType.SEEDSIGNER,
    SignerType.BITBOX02,
    SignerType.OTHER_SD,
  ];
  const L2Signers = [...L1Signers, SignerType.POLICY_SERVER];
  const L3Signers = [...L2Signers, SignerType.INHERITANCEKEY];

  const plan = keeper.subscription.name.toUpperCase();
  const validSigners =
    plan === SubscriptionTier.L1.toUpperCase()
      ? L1Signers
      : plan === SubscriptionTier.L2.toUpperCase()
      ? L2Signers
      : L3Signers;

  return { validSigners };
};

export default useSubscription;
