import React, { useEffect, useState, useContext } from 'react';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { RealmSchema } from 'src/storage/realm/enum';
import { useAppSelector } from 'src/store/hooks';
import { addToUaiStack, updateUaiStack } from 'src/store/sagaActions/uai';
import { UAI, uaiType } from 'src/common/data/models/interfaces/Uai';
import { useDispatch } from 'react-redux';
import { Wallet } from 'src/core/wallets/interfaces/interface';
import { WalletType } from 'src/core/wallets/interfaces/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';

export const useUaiStack = () => {
  const { useQuery } = useContext(RealmWrapperContext);
  const [uaiStack, setuaiStack] = useState([]);
  const UAIcollection = useQuery(RealmSchema.UAI);
  const dispatch = useDispatch();

  const netBalance = useAppSelector((state) => state.wallet.netBalance);
  const Vault: Wallet = useQuery(RealmSchema.Wallet)
    .filter((wallet: Wallet) => wallet.type === WalletType.READ_ONLY)
    .map(getJSONFromRealmObject)[0];

  //creation of default stack
  useEffect(() => {
    const uai_SECURE_VAULT = UAIcollection.filter(
      (uai) => uai.uaiType === uaiType.SECURE_VAULT && uai.isActioned === false
    )[0];

    if (!Vault) {
      if (!uai_SECURE_VAULT) {
        dispatch(
          addToUaiStack(
            'Select and add a Signer to activate your Vault',
            false,
            uaiType.SECURE_VAULT,
            80,
            null
          )
        );
      }
    }

    if (Vault && uai_SECURE_VAULT) {
      let updatedUai: UAI = JSON.parse(JSON.stringify(uai_SECURE_VAULT)); //Need to get a better way
      updatedUai = { ...updatedUai, isActioned: true };
      dispatch(updateUaiStack(updatedUai));
    }
  }, [Vault]);

  useEffect(() => {
    if (netBalance >= 10000) {
      dispatch(
        addToUaiStack(
          'Approve Vault transfer',
          true,
          uaiType.VAULT_TRANSFER,
          70,
          'Your wallet balance is above 10,000sats'
        )
      );
    }
  }, [netBalance]);

  //TO-DO: fetch notifications and converto UAI

  const uaiStackCreation = (UAIcollection) => {
    const filteredStack = UAIcollection.filter((uai) => uai.isActioned === false);
    const sortedStack = filteredStack.sort((a, b) => b.prirority - a.prirority);
    setuaiStack(sortedStack);
  };

  useEffect(() => {
    uaiStackCreation(UAIcollection);
  }, [JSON.stringify(UAIcollection)]);

  return { uaiStack };
};
