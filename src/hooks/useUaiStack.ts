import { UAI } from 'src/common/data/models/interfaces/Uai';
import { useContext, useEffect, useState } from 'react';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { useAppSelector } from 'src/store/hooks';

const useUaiStack = () => {
  const { useQuery } = useContext(RealmWrapperContext);
  const [uaiStack, setUaiStack] = useState([]);
  const UAIcollection: UAI[] = useQuery(RealmSchema.UAI);
  const refreshUai = useAppSelector((state) => state.uai.refreshUai);

  const uaiStackCreation = (UAIcollection) => {
    const filteredStack = UAIcollection.filter((uai) => uai.isActioned === false);
    const sortedStack = filteredStack.sort((a, b) => b.prirority - a.prirority);
    setUaiStack(sortedStack);
  };

  useEffect(() => {
    uaiStackCreation(UAIcollection);
  }, [refreshUai]);

  return { uaiStack };
};

export default useUaiStack;
