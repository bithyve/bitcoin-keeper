import { useEffect, useState } from 'react';
import { Vault, VaultSigner } from 'src/core/wallets/interfaces/vault';
import { SignerType, VaultMigrationType, XpubTypes } from 'src/core/wallets/enums';

import { useAppSelector } from 'src/store/hooks';
import usePlan from 'src/hooks/usePlan';
import useVault from 'src/hooks/useVault';
import { SubscriptionTier } from 'src/common/data/enums/SubscriptionTier';
import { getSignerSigTypeInfo, isSignerAMF } from 'src/hardware';
import idx from 'idx';

const hasPlanChanged = (vault: Vault, subscriptionScheme): VaultMigrationType => {
  if (vault) {
    const currentScheme = vault.scheme;
    if (currentScheme.m > subscriptionScheme.m) {
      return VaultMigrationType.DOWNGRADE;
    }
    if (currentScheme.m < subscriptionScheme.m) {
      return VaultMigrationType.UPGRADE;
    }
    return VaultMigrationType.CHANGE;
  }
  return VaultMigrationType.CHANGE;
};

const getPrefillForSignerList = (planStatus, vaultSigners, currentSignerLimit) => {
  let fills;
  if (planStatus === VaultMigrationType.DOWNGRADE) {
    if (vaultSigners.length < currentSignerLimit) {
      fills = new Array(currentSignerLimit - vaultSigners.length).fill(null);
    } else {
      fills = [];
    }
  } else if (vaultSigners.length > currentSignerLimit) {
    fills = []; // if signers are added but no vault is created
  } else {
    fills = new Array(currentSignerLimit - vaultSigners.length).fill(null);
  }
  return fills;
};

const signerLimitMatchesSubscriptionScheme = ({ vaultSigners, currentSignerLimit }) =>
  vaultSigners && vaultSigners.length !== currentSignerLimit;

const areSignersSame = ({ activeVault, signersState }) => {
  if (!activeVault) {
    return false;
  }
  const currentSignerIds = signersState.map((signer) => (signer ? signer.signerId : ''));
  const activeSignerIds = activeVault.signers.map((signer) => signer.signerId);
  return currentSignerIds.sort().join() === activeSignerIds.sort().join();
};

const areSignersValidInCurrentScheme = ({ plan, signersState }) => {
  if (plan !== SubscriptionTier.L1.toUpperCase()) {
    return true;
  }
  return signersState.every(
    (signer) =>
      signer &&
      ![
        SignerType.MOBILE_KEY,
        SignerType.POLICY_SERVER,
        SignerType.KEEPER,
        SignerType.SEED_WORDS,
      ].includes(signer.type)
  );
};

const updateSignerForScheme = (signer: VaultSigner, subscriptionScheme) => {
  const { n } = subscriptionScheme;
  const xPubTypeToSwitch = n === 1 ? XpubTypes.P2WPKH : XpubTypes.P2WSH;
  const completeSigner =
    !!idx(signer, (_) => _.xpubDetails[XpubTypes.P2WPKH].xpub) &&
    !!idx(signer, (_) => _.xpubDetails[XpubTypes.P2WSH].xpub);
  const shouldSwitchXpub =
    completeSigner && signer.xpub !== signer.xpubDetails[xPubTypeToSwitch].xpub;
  if (shouldSwitchXpub) {
    return {
      ...signer,
      xpub: signer.xpubDetails[xPubTypeToSwitch].xpub,
      derivationPath: signer.xpubDetails[xPubTypeToSwitch].derivationPath,
    };
  }
  return signer;
};

const useSignerIntel = () => {
  const { activeVault } = useVault();
  const { subscriptionScheme, plan } = usePlan();
  const currentSignerLimit = subscriptionScheme.n;
  const planStatus = hasPlanChanged(activeVault, subscriptionScheme);
  const vaultSigners = useAppSelector((state) => state.vault.signers);
  const [signersState, setSignersState] = useState(vaultSigners);

  useEffect(() => {
    const fills = getPrefillForSignerList(planStatus, vaultSigners, currentSignerLimit);
    setSignersState(
      vaultSigners.map((signer) => updateSignerForScheme(signer, subscriptionScheme)).concat(fills)
    );
  }, [vaultSigners]);

  const areSignersValid =
    signersState.every((signer) => !signer) ||
    signerLimitMatchesSubscriptionScheme({ vaultSigners, currentSignerLimit }) ||
    areSignersSame({ activeVault, signersState }) ||
    !areSignersValidInCurrentScheme({ plan, signersState });

  const amfSigners = [];
  const misMatchedSigners = [];
  signersState.forEach((signer: VaultSigner) => {
    if (signer) {
      if (isSignerAMF(signer)) amfSigners.push(signer.type);
      const { isSingleSig, isMultiSig } = getSignerSigTypeInfo(signer);
      if (
        (plan === SubscriptionTier.L1.toUpperCase() && !isSingleSig) ||
        (plan !== SubscriptionTier.L1.toUpperCase() && !isMultiSig)
      ) {
        misMatchedSigners.push(signer.masterFingerprint);
      }
    }
  });

  return { planStatus, signersState, areSignersValid, amfSigners, misMatchedSigners };
};

export default useSignerIntel;
