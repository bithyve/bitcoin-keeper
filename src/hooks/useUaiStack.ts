import { UAI, uaiType } from 'src/common/data/models/interfaces/Uai';
import { addToUaiStack, uaiActionedEntity, updateUaiStack } from 'src/store/sagaActions/uai';
import { useContext, useEffect, useState } from 'react';

import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { Wallet } from 'src/core/wallets/interfaces/wallet';

export const useUaiStack = () => {
  const { useQuery } = useContext(RealmWrapperContext);
  const [uaiStack, setuaiStack] = useState([]);
  const UAIcollection: UAI[] = useQuery(RealmSchema.UAI);
  const dispatch = useDispatch();

  const netBalance = useAppSelector((state) => state.wallet.netBalance);
  const defaultVault: Vault = useQuery(RealmSchema.Vault)
    .map(getJSONFromRealmObject)
    .filter((vault) => !vault.archived)[0];

  const wallets: Wallet[] = useQuery(RealmSchema.Wallet);
  //creation of default stack
  useEffect(() => {
    const uai_SECURE_VAULT = UAIcollection.filter(
      (uai) => uai.uaiType === uaiType.SECURE_VAULT && uai.isActioned === false
    )[0];

    if (!defaultVault) {
      if (!uai_SECURE_VAULT) {
        dispatch(
          addToUaiStack(
            'Add a signing device to activate your vault',
            false,
            uaiType.SECURE_VAULT,
            80,
            null
          )
        );
      }
    }

    if (defaultVault && uai_SECURE_VAULT) {
      let updatedUai: UAI = JSON.parse(JSON.stringify(uai_SECURE_VAULT)); //Need to get a better way
      updatedUai = { ...updatedUai, isActioned: true };
      dispatch(updateUaiStack(updatedUai));
    }
  }, [defaultVault]);

  useEffect(() => {
    wallets.map((wallet) => {
      if (wallet.specs.balances.confirmed >= Number(wallet.specs.transferPolicy)) {
        const uai = UAIcollection.find((uai) => uai.entityId === wallet.id);
        if (uai) {
          if (wallet.specs.balances.unconfirmed >= Number(wallet.specs.transferPolicy)) return;
          else dispatch(uaiActionedEntity(uai.entityId, false));
        } else {
          dispatch(
            addToUaiStack(
              `Transfer fund to vault for ${wallet.presentationData.name}`,
              false,
              uaiType.VAULT_TRANSFER,
              100,
              null,
              wallet.id
            )
          );
        }
      }
    });
  }, []);

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
