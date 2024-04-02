import { UAI, uaiType } from 'src/models/interfaces/Uai';
import { useEffect, useState } from 'react';
import { RealmSchema } from 'src/storage/realm/enum';
import { useAppSelector } from 'src/store/hooks';
import { useQuery } from '@realm/react';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import uai from 'src/store/reducers/uai';

interface PriorityMap {
  [entityKind: string]: number;
}

const priorityMap: PriorityMap = {
  [uaiType.IKS_REQUEST]: 100,
  [uaiType.SIGNING_DEVICES_HEALTH_CHECK]: 90,
  [uaiType.RECOVERY_PHRASE_HEALTH_CHECK]: 90,
  [uaiType.VAULT_TRANSFER]: 80,
  [uaiType.SECURE_VAULT]: 70,
  [uaiType.DEFAULT]: 0,
};

const useUaiStack = (): { uaiStack: UAI[] } => {
  const [uaiStack, setUaiStack] = useState<UAI[]>([]); // sorted uai for UI consumtions
  const UAIcollection: UAI[] = useQuery(RealmSchema.UAI).map(getJSONFromRealmObject);
  const refreshUai = useAppSelector((state) => state.uai.refreshUai);
  const uaiActionMap = useAppSelector((state) => state.uai.uaiActionMap);

  const nonActionedUais = UAIcollection.filter((uai) => !uaiActionMap[uai.id]);

  const sortUAIsByPriorityAndLastActioned = (uaisArray: UAI[]): UAI[] => {
    return uaisArray.sort((a, b) => {
      const priorityDiff = priorityMap[b.uaiType] - priorityMap[a.uaiType];
      if (priorityDiff === 0) {
        if (!a.lastActioned && !b.lastActioned) return 0;
        if (!a.lastActioned) return -1;
        if (!b.lastActioned) return 1;
        return a.lastActioned.getTime() - b.lastActioned.getTime();
      } else {
        return priorityDiff;
      }
    });
  };

  useEffect(() => {
    const sortedStack = sortUAIsByPriorityAndLastActioned(nonActionedUais);
    setUaiStack(sortedStack);
  }, [refreshUai]);

  return { uaiStack };
};

export default useUaiStack;
