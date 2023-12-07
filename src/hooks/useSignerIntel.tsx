import { useEffect, useState } from 'react';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import { SignerType, XpubTypes } from 'src/core/wallets/enums';

import { useAppSelector } from 'src/store/hooks';
import useVault from 'src/hooks/useVault';
import { getSignerNameFromType, getSignerSigTypeInfo, isSignerAMF } from 'src/hardware';
import idx from 'idx';
import WalletUtilities from 'src/core/wallets/operations/utils';
import config from 'src/core/config';
import useSubscription from './useSubscription';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';

const getPrefillForSignerList = (scheme, vaultSigners) => {
  let fills = [];
  if (vaultSigners.length < scheme.n) {
    fills = new Array(scheme.n - vaultSigners.length).fill(null);
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

export const updateSignerForScheme = (signer: VaultSigner, schemeN) => {
  const xPubTypeToSwitch = schemeN === 1 ? XpubTypes.P2WPKH : XpubTypes.P2WSH;
  const completeSigner =
    !!idx(signer, (_) => _.xpubDetails[XpubTypes.P2WPKH].xpub) &&
    !!idx(signer, (_) => _.xpubDetails[XpubTypes.P2WSH].xpub);
  const shouldSwitchXpub =
    completeSigner && signer.xpub !== signer.xpubDetails[xPubTypeToSwitch].xpub;
  if (shouldSwitchXpub) {
    const switchedXpub = signer.xpubDetails[xPubTypeToSwitch].xpub;
    const switchedDerivation = signer.xpubDetails[xPubTypeToSwitch].derivationPath;
    const switchedXpriv = signer.xpubDetails[xPubTypeToSwitch].xpriv;
    const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
    return {
      ...signer,
      xpub: switchedXpub,
      derivationPath: switchedDerivation,
      xpriv: switchedXpriv,
      signerId: WalletUtilities.getFingerprintFromExtendedKey(switchedXpub, network),
    };
  }
  return signer;
};

const useSignerIntel = ({ scheme }) => {
  const { activeVault } = useVault();
  const vaultSigners = useAppSelector((state) => state.vault.signers);
  const [signersState, setSignersState] = useState(vaultSigners);
  const { validSigners } = useSubscription();

  useEffect(() => {
    const fills = getPrefillForSignerList(scheme, vaultSigners);
    setSignersState(
      vaultSigners.map((signer) => updateSignerForScheme(signer, scheme.n)).concat(fills)
    );
  }, [vaultSigners]);

  const amfSigners = [];
  const misMatchedSigners = [];
  signersState.forEach((signer: VaultSigner) => {
    if (signer) {
      if (isSignerAMF(signer)) amfSigners.push(signer.type);
      const { isSingleSig, isMultiSig } = getSignerSigTypeInfo(signer);
      if ((scheme.n === 1 && !isSingleSig) || (scheme.n !== 1 && !isMultiSig)) {
        misMatchedSigners.push(signer.masterFingerprint);
      }
    }
  });

  let invalidIKS = false;
  let invalidSS = false;
  let invalidMessage = '';

  signersState.forEach((signer) => {
    if (signer) {
      if (signer.type === SignerType.INHERITANCEKEY) {
        if (!validSigners.includes(signer.type)) {
          invalidIKS = true;
          invalidMessage = `${getSignerNameFromType(signer.type)} is not allowed in ${
            SubscriptionTier.L2
          } Please upgrade your plan or remove them`;
        } else if (vaultSigners.length < 5) {
          invalidIKS = true;
          invalidMessage = `You need at least 5 signers to use ${getSignerNameFromType(
            signer.type
          )}. Please add more signers`;
        }
      }
      if (signer.type === SignerType.POLICY_SERVER) {
        if (!validSigners.includes(signer.type)) {
          invalidSS = true;
          invalidMessage = `${getSignerNameFromType(signer.type)} is not allowed in ${
            SubscriptionTier.L1
          } Please upgrade your plan or remove them`;
        } else if (vaultSigners.length < 3) {
          invalidSS = true;
          invalidMessage = `You need at least 3 signers to use ${getSignerNameFromType(
            signer.type
          )}. Please add more signers`;
        }
      }
    }
  });

  const areSignersValid =
    signersState.every((signer) => !signer) ||
    signerLimitMatchesSubscriptionScheme({ vaultSigners, currentSignerLimit: scheme.n }) ||
    areSignersSame({ activeVault, signersState }) ||
    !!misMatchedSigners.length ||
    invalidIKS ||
    invalidSS;

  return {
    signersState,
    areSignersValid,
    amfSigners,
    misMatchedSigners,
    invalidSS,
    invalidIKS,
    invalidMessage,
  };
};

export default useSignerIntel;
