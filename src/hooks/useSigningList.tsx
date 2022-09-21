import React, { useState, useEffect } from 'react';
import { SignerStorage, SignerType } from 'src/core/wallets/enums';
import { WalletMap } from 'src/screens/Vault/WalletMap';

const useSigningList = () => {
  const [SD] = useState<SignerType[]>([
    SignerType.MOBILE_KEY,
    SignerType.POLICY_SERVER,
    SignerType.TREZOR,
    SignerType.KEYSTONE,
    SignerType.PASSPORT,
    SignerType.JADE,
    SignerType.LEDGER,
    SignerType.TAPSIGNER,
    SignerType.COLDCARD,
  ])
  const inActiveSigners: SignerType[] = [];
  const activeSigners: SignerType[] = [];

  for (let i = 0; i < SD.length; i++) {
    if (WalletMap(SD[i]).disable) {
      inActiveSigners.push(SD[i])
    } else {
      activeSigners.push(SD[i])
    }
  }

  return [...activeSigners, ...inActiveSigners];
};

export default useSigningList;
