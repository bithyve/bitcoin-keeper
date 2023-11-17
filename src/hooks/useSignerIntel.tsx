import { useEffect, useState } from 'react';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import { SignerType, XpubTypes } from 'src/core/wallets/enums';

import { useAppSelector } from 'src/store/hooks';
import useVault from 'src/hooks/useVault';
import { getSignerSigTypeInfo, isSignerAMF } from 'src/hardware';
import idx from 'idx';
import WalletUtilities from 'src/core/wallets/operations/utils';
import config from 'src/core/config';

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

const areSignersValidInCurrentScheme = () => {
  // if (plan !== SubscriptionTier.L1.toUpperCase()) {
  //   return true;
  // }
  // return signersState.every(
  //   (signer) => signer && ![SignerType.MOBILE_KEY, SignerType.POLICY_SERVER].includes(signer.type)
  // );
  return true;
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
    const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
    return {
      ...signer,
      xpub: switchedXpub,
      derivationPath: switchedDerivation,
      signerId: WalletUtilities.getFingerprintFromExtendedKey(switchedXpub, network),
    };
  }
  return signer;
};

const useSignerIntel = ({ scheme }) => {
  const { activeVault } = useVault();
  const vaultSigners = useAppSelector((state) => state.vault.signers);
  const [signersState, setSignersState] = useState(vaultSigners);

  useEffect(() => {
    const fills = getPrefillForSignerList(scheme, vaultSigners);
    setSignersState(
      vaultSigners.map((signer) => updateSignerForScheme(signer, scheme.n)).concat(fills)
    );
  }, [vaultSigners, scheme]);

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
  const getInvalidSignerForTire = () => {
    if (scheme.n === 1 && signersState) {
      return signersState.filter(
        (signer) =>
          signer && [SignerType.MOBILE_KEY, SignerType.POLICY_SERVER].includes(signer.type)
      );
    }
    return [];
  };
  const invalidSigners = getInvalidSignerForTire();

  const areSignersValid =
    signersState.every((signer) => !signer) ||
    signerLimitMatchesSubscriptionScheme({ vaultSigners, currentSignerLimit: scheme.n }) ||
    areSignersSame({ activeVault, signersState }) ||
    !areSignersValidInCurrentScheme(); //TODO ||
  misMatchedSigners.length;

  return {
    signersState,
    areSignersValid,
    amfSigners,
    misMatchedSigners,
    invalidSigners,
  };
};

export default useSignerIntel;
