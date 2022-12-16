import { UAI, uaiType } from 'src/common/data/models/interfaces/Uai';
import { addToUaiStack, uaiActionedEntity, updateUaiStack } from 'src/store/sagaActions/uai';
import { useContext, useEffect, useState } from 'react';

import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { useDispatch } from 'react-redux';
import { Wallet } from 'src/core/wallets/interfaces/wallet';

//TO-DO: Write on DB should not happen

const useUaiStack = () => {
  const { useQuery } = useContext(RealmWrapperContext);
  const [uaiStack, setuaiStack] = useState([]);
  const UAIcollection: UAI[] = useQuery(RealmSchema.UAI);
  const dispatch = useDispatch();

  const defaultVault: Vault = useQuery(RealmSchema.Vault)
    .map(getJSONFromRealmObject)
    .filter((vault) => !vault.archived)[0];

  // creation of default stack
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
            100,
            null
          )
        );
      }
    }

    if (defaultVault && uai_SECURE_VAULT) {
      let updatedUai: UAI = JSON.parse(JSON.stringify(uai_SECURE_VAULT)); // Need to get a better way
      updatedUai = { ...updatedUai, isActioned: true };
      dispatch(updateUaiStack(updatedUai));
    }
  }, [defaultVault]);

  // TO-DO: fetch notifications and converto UAI
  const uaiStackCreation = (UAIcollection) => {
    const filteredStack = UAIcollection.filter((uai) => uai.isActioned === false);
    const sortedStack = filteredStack.sort((a, b) => b.prirority - a.prirority);
    setuaiStack(sortedStack);
  };

  //Realm UAI updates
  useEffect(() => {
    uaiStackCreation(UAIcollection);
  }, [JSON.stringify(UAIcollection)]);

  return { uaiStack };
};

export default useUaiStack;
