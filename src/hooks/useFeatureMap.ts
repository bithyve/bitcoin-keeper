import { useContext, useEffect, useState } from 'react';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { VaultScheme } from 'src/core/wallets/interfaces/vault';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { RealmSchema } from 'src/storage/realm/enum';

interface FeatureMap {
  walletRecieve?: boolean;
  walletBuy?: boolean;
  vaultRecieve?: boolean;
  vaultBuy?: boolean;
}

interface UseFeatureMapProps {
  walletIndex?: number;
  scheme?: VaultScheme;
}

type useFeatureMapInterface = (props?: UseFeatureMapProps) => FeatureMap;

const useFeatureMap: useFeatureMapInterface = ({ walletIndex, scheme }) => {
  const { useQuery } = useContext(RealmWrapperContext);
  const {
    subscription: { level },
  }: KeeperApp = useQuery(RealmSchema.KeeperApp)[0];
  const [featureMap, setFeatureMap] = useState<FeatureMap>({
    walletRecieve: level >= 2,
    walletBuy: level >= 2,
    vaultRecieve: level >= 2,
    vaultBuy: level >= 2,
  });

  useEffect(() => {
    let updatedFeatureMap: FeatureMap = {};
    if (level < 2 && walletIndex > 2) {
      updatedFeatureMap.walletBuy = false;
      updatedFeatureMap.walletRecieve = false;
    } else {
      updatedFeatureMap.walletBuy = true;
      updatedFeatureMap.walletRecieve = true;
    }
    setFeatureMap((prevFeatureMap) => ({ ...prevFeatureMap, ...updatedFeatureMap }));
  }, [walletIndex]);

  useEffect(() => {
    let updatedFeatureMap: FeatureMap = {};
    console.log(scheme);
    if (level < 2) {
      updatedFeatureMap.vaultBuy = false;
      if (scheme.m !== 1 || scheme.n !== 1) updatedFeatureMap.vaultRecieve = false;
      else updatedFeatureMap.vaultRecieve = true;
    } else {
      updatedFeatureMap.vaultBuy = true;
      updatedFeatureMap.vaultRecieve = true;
    }
    setFeatureMap((prevFeatureMap) => ({ ...prevFeatureMap, ...updatedFeatureMap }));
  }, [scheme]);

  useEffect(() => {
    console.log(featureMap);
  }, [featureMap]);

  return featureMap;
};

export default useFeatureMap;
