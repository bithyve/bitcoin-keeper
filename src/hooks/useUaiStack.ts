import React, { useEffect, useState, useContext } from 'react';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { RealmSchema } from 'src/storage/realm/enum';
import { useAppSelector } from 'src/store/hooks';
import { addToUaiStack } from 'src/store/sagaActions/uai';
import { uaiType } from 'src/common/data/models/interfaces/Uai';
import { useDispatch } from 'react-redux';

export const useUaiStack = () => {
  const { useQuery } = useContext(RealmWrapperContext);
  const [uaiStack, setuaiStack] = useState([]);
  const UAIcollection = useQuery(RealmSchema.UAI);
  const dispatch = useDispatch();
  const netBalance = useAppSelector((state) => state.wallet.netBalance);

  useEffect(() => {
    if (netBalance >= 10000) {
      dispatch(
        addToUaiStack(
          'Approve Vault transfer',
          true,
          uaiType.VAULT_TRANSFER,
          70,
          'Your wallet balance is above 1,000,000sats'
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
