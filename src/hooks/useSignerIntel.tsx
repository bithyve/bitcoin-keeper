import { SignerType } from 'src/core/wallets/enums';
import { getSignerNameFromType, isSignerAMF } from 'src/hardware';
import useSubscription from './useSubscription';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import useSignerMap from './useSignerMap';

const areSignersSame = ({ existingKeys, vaultKeys }) => {
  if (!existingKeys.length || !vaultKeys.length) {
    return false;
  }
  const currentXfps = vaultKeys.map((signer) => (signer ? signer.xfp : ''));
  const activeXfps = existingKeys.map((signer) => signer.xfp);
  return currentXfps.sort().join() === activeXfps.sort().join();
};

const useSignerIntel = ({ scheme, vaultKeys, selectedSigners, existingKeys }) => {
  const { validSigners } = useSubscription();
  const { signerMap } = useSignerMap();

  const amfSigners = [];
  for (let mfp of selectedSigners.keys()) {
    const signer = signerMap[mfp];
    if (isSignerAMF(signer)) amfSigners.push(signer.type);
  }

  let invalidIKS = false;
  let invalidSS = false;
  let invalidMessage = '';

  vaultKeys.forEach((key) => {
    if (key) {
      const signerName = getSignerNameFromType(signerMap[key.masterFingerprint].type);
      if (signerMap[key.masterFingerprint].type === SignerType.INHERITANCEKEY) {
        if (!validSigners.includes(signerMap[key].type)) {
          invalidIKS = true;
          invalidMessage = `${signerName} is not allowed in ${SubscriptionTier.L2} Please upgrade your plan or remove them`;
        } else if (vaultKeys.length < 5) {
          invalidIKS = true;
          invalidMessage = `You need at least 5 signers to use ${signerName}. Please add more signers`;
        }
      }
      if (signerMap[key.masterFingerprint].type === SignerType.POLICY_SERVER) {
        if (!validSigners.includes(signerMap[key.masterFingerprint].type)) {
          invalidSS = true;
          invalidMessage = `${signerName} is not allowed in ${SubscriptionTier.L1} Please upgrade your plan or remove them`;
        } else if (vaultKeys.length < 3) {
          invalidSS = true;
          invalidMessage = `You need at least 3 signers to use ${signerName}. Please add more signers`;
        }
      }
    }
  });

  const areSignersValid =
    vaultKeys.every((signer) => !signer) ||
    scheme.n !== vaultKeys.length ||
    areSignersSame({ existingKeys, vaultKeys }) ||
    invalidIKS ||
    invalidSS;

  return {
    areSignersValid,
    amfSigners,
    invalidSS,
    invalidIKS,
    invalidMessage,
  };
};

export default useSignerIntel;
