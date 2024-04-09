import { useEffect, useState } from 'react';
import { useQuery } from '@realm/react';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { UAI, uaiType } from 'src/models/interfaces/Uai';
import { RealmSchema } from 'src/storage/realm/enum';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import useUaiStack from './useUaiStack';

interface Props {
  types?: uaiType[];
  entityId?: string;
}

export const useIndicatorHook = ({ types, entityId }: Props) => {
  const { uaiStack } = useUaiStack();
  const { id }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];

  const [indicatorMap, setIndicatorMap] = useState({
    typeBasedMap: {},
    entityBasedMap: {},
  });

  const createTypeBasedMap = () => {
    const typeBasedMap: { [key in uaiType]?: { [key: string]: boolean } } = {};
    types.forEach((type) => {
      typeBasedMap[type] = {};
      uaiStack.forEach((uai) => {
        if (uai.uaiType === type) {
          if (uai.entityId === null) {
            typeBasedMap[type][id] = true;
          }
          typeBasedMap[type][uai.entityId] = true;
        }
      });
    });
    return typeBasedMap;
  };

  const createEntityBasedMap = () => {
    const entityBasedMap: { [key: string]: { [key in uaiType]?: boolean } } = {};
    uaiStack.forEach((uai) => {
      if (uai.entityId === entityId) {
        if (!entityBasedMap[entityId]) {
          entityBasedMap[entityId] = {};
        }
        entityBasedMap[uai.entityId][uai.uaiType] = true;
      }
    });
    return entityBasedMap;
  };

  useEffect(() => {
    if (types) {
      const typeBasedIndicator = createTypeBasedMap();
      setIndicatorMap((prevState) => ({ ...prevState, typeBasedIndicator }));
    }
    if (entityId) {
      const entityBasedIndicator = createEntityBasedMap();
      setIndicatorMap((prevState) => ({ ...prevState, entityBasedIndicator }));
    }
  }, [uaiStack]);

  return indicatorMap;
};
