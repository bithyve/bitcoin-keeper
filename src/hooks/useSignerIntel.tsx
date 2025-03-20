import { MiniscriptTypes, SignerType } from 'src/services/wallets/enums';
import { getSignerNameFromType, isSignerAMF } from 'src/hardware';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import { VaultScheme, VaultSigner } from 'src/services/wallets/interfaces/vault';
import useSignerMap from './useSignerMap';
import usePlan from './usePlan';
import { getKeyUID } from 'src/utils/utilities';

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

  const amfSigners = [];
  for (const signerIdentifier of selectedSigners.keys()) {
    const signer = signerMap[signerIdentifier];
    if (isSignerAMF(signer)) amfSigners.push(signer.type);
  }

  let invalidSS = false;
  let invalidMessage = '';

  vaultKeys.forEach((key) => {
    if (key) {
      const isSS = signerMap[getKeyUID(key)].type === SignerType.POLICY_SERVER;
      const signerName = getSignerNameFromType(signerMap[getKeyUID(key)].type);
      if (isSS) {
        if (isOnL1) {
          invalidSS = true;
          invalidMessage = `${signerName} is allowed from ${SubscriptionTier.L2} Please upgrade your plan or remove them`;
        } else if (scheme.m < 2 || scheme.n < 3) {
          invalidSS = true;
          invalidMessage = `You need at least 3 signers and 2 required signers to use ${signerName}. Please add more signers`;
        }
      }
    }
  });
  let areSignersValid = false;

  if (!selectedSigners) {
    areSignersValid = false;
  } else {
    const signerCount = Array.from(selectedSigners.keys()).length;
    const maxKeys = scheme?.miniscriptScheme?.usedMiniscriptTypes?.includes(
      MiniscriptTypes.INHERITANCE
    )
      ? scheme.n + 1
      : scheme.n;
    areSignersValid =
      signerCount > 0 &&
      !(
        vaultKeys.every((signer) => !signer) ||
        maxKeys !== vaultKeys.length ||
        areSignersSame({ existingKeys, vaultKeys }) ||
        invalidSS
      );
  }
  return {
    areSignersValid,
    amfSigners,
    invalidSS,
    invalidMessage,
  };
};

export default useSignerIntel;
