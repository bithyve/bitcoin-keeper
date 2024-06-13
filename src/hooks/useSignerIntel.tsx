import { SignerType } from 'src/services/wallets/enums';
import { getSignerNameFromType, isSignerAMF } from 'src/hardware';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import { VaultScheme, VaultSigner } from 'src/services/wallets/interfaces/vault';
import useSignerMap from './useSignerMap';
import usePlan from './usePlan';

const areSignersSame = ({ existingKeys, vaultKeys }) => {
  if (!existingKeys.length || !vaultKeys.length) {
    return false;
  }
  const currentXfps = vaultKeys.map((signer) => (signer ? signer.xfp : ''));
  const activeXfps = existingKeys.map((signer) => signer.xfp);
  return currentXfps.sort().join() === activeXfps.sort().join();
};

const useSignerIntel = ({
  scheme,
  vaultKeys,
  selectedSigners,
  existingKeys,
}: {
  scheme: VaultScheme;
  vaultKeys: VaultSigner[];
  selectedSigners;
  existingKeys: VaultSigner[];
}) => {
  const { signerMap } = useSignerMap();
  const { plan } = usePlan();
  const isOnL1 = plan === SubscriptionTier.L1.toUpperCase();
  const isOnL3 = plan === SubscriptionTier.L3.toUpperCase();

  const amfSigners = [];
  for (const mfp of selectedSigners.keys()) {
    const signer = signerMap[mfp];
    if (isSignerAMF(signer)) amfSigners.push(signer.type);
  }

  let invalidIKS = false;
  let invalidSS = false;
  let invalidMessage = '';

  vaultKeys.forEach((key) => {
    if (key) {
      const isIKS = signerMap[key.masterFingerprint].type === SignerType.INHERITANCEKEY;
      const isSS = signerMap[key.masterFingerprint].type === SignerType.POLICY_SERVER;
      const signerName = getSignerNameFromType(signerMap[key.masterFingerprint].type);
      if (isSS) {
        if (isOnL1) {
          invalidSS = true;
          invalidMessage = `${signerName} is allowed from ${SubscriptionTier.L2} Please upgrade your plan or remove them`;
        } else if (scheme.m < 2 || scheme.n < 3) {
          invalidSS = true;
          invalidMessage = `You need at least 3 signers and 2 required signers to use ${signerName}. Please add more signers`;
        }
      }
      if (isIKS) {
        if (!isOnL3) {
          invalidIKS = true;
          invalidMessage = `${signerName} is allowed from ${SubscriptionTier.L3} Please upgrade your plan or remove them`;
        } else if (scheme.m < 2 || scheme.n < 3) {
          invalidIKS = true;
          invalidMessage = `You need at least 3 signers and 2 required signers to use ${signerName}. Please add more signers`;
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
