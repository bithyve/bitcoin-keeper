import React, { useEffect, useState } from 'react';
import { RealmContext } from 'src/storage/realm/RealmProvider';
import { RealmSchema } from 'src/storage/realm/enum';

const { useQuery } = RealmContext;

export const useUaiStack = () => {
  const [uaiStack, setuaiStack] = useState([]);
  const UAIcollection = useQuery(RealmSchema.UAI);

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
