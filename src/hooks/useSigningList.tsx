import React from 'react';
import { SignerType } from 'src/core/wallets/enums';
import { useState } from 'react';

const Signers = [
  SignerType.MOBILE_KEY,
  SignerType.POLICY_SERVER,
  SignerType.KEEPER,
  SignerType.SEED_WORDS,
  SignerType.TAPSIGNER,
  SignerType.LEDGER,
  SignerType.COLDCARD,
  SignerType.TREZOR,
  SignerType.PASSPORT,
  SignerType.JADE,
  SignerType.KEYSTONE,
];

const useSigningList = (isNfcSupported, isBLESupported, getDeviceStatus) => {
  const [sortedSigners, setSigners] = useState<SignerType[]>([]);

  React.useEffect(() => {
    const inActiveSigners = [];
    const activeSigners = [];
    Signers.map((signer) => {
      return { type: signer, disabled: getDeviceStatus(signer).disabled };
    }).forEach((signer) =>
      signer.disabled ? inActiveSigners.push(signer.type) : activeSigners.push(signer.type)
    );
    setSigners([...activeSigners, ...inActiveSigners]);
  }, [isNfcSupported, isBLESupported]);

  return sortedSigners;
};

export default useSigningList;
