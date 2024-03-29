import { useQuery } from '@realm/react';
import { useEffect, useState } from 'react';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { VaultScheme } from 'src/services/wallets/interfaces/vault';
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
  isCollaborativeWallet?: boolean;
}

type useFeatureMapInterface = (props?: UseFeatureMapProps) => FeatureMap;

const useFeatureMap: useFeatureMapInterface = ({
  walletIndex,
  scheme,
  isCollaborativeWallet = false,
}) => {
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
    const updatedFeatureMap: FeatureMap = {};
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
    const updatedFeatureMap: FeatureMap = {};
    if (level < 2 && !isCollaborativeWallet) {
      updatedFeatureMap.vaultBuy = false;
      if (scheme) {
        if (scheme.m !== 1 || scheme.n !== 1) {
          updatedFeatureMap.vaultRecieve = false;
        } else updatedFeatureMap.vaultRecieve = true;
      } else updatedFeatureMap.vaultRecieve = true;
    } else {
      updatedFeatureMap.vaultBuy = true;
      updatedFeatureMap.vaultRecieve = true;
    }
    setFeatureMap((prevFeatureMap) => ({ ...prevFeatureMap, ...updatedFeatureMap }));
  }, [scheme]);

  return featureMap;
};

export default useFeatureMap;
