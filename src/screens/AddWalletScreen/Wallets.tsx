import { Box } from 'native-base';
import React from 'react';
import OptionCard from 'src/components/OptionCard';
import WalletGreenIcon from 'src/assets/images/wallet_green.svg';
import VaultGreenIcon from 'src/assets/images/vault_green.svg';
import CollaborativeIcon from 'src/assets/images/collaborative_vault.svg';
import useWallets from 'src/hooks/useWallets';
import { WalletType } from 'src/services/wallets/enums';
import { CommonActions } from '@react-navigation/native';
import { VaultScheme } from 'src/services/wallets/interfaces/vault';
import UpgradeSubscription from '../InheritanceToolsAndTips/components/UpgradeSubscription';
import usePlan from 'src/hooks/usePlan';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';

function Wallets({ navigation }) {
  const { wallets } = useWallets({ getAll: true });
  const { plan } = usePlan();
  const isDiamondHand = plan === SubscriptionTier.L3.toUpperCase();

  const navigateToVaultSetup = (scheme: VaultScheme) => {
    navigation.dispatch(CommonActions.navigate({ name: 'VaultSetup', params: { scheme } }));
  };

  const navigateToWalletCreation = () => {
    navigation.navigate('EnterWalletDetail', {
      name: `Wallet ${wallets.length + 1}`,
      description: '',
      type: WalletType.DEFAULT,
    });
  };

  const handleCollaaborativeWalletCreation = () => {
    navigation.navigate('SetupCollaborativeWallet');
  };

  return (
    <Box>
      <OptionCard
        title="Hot Wallet"
        description="Using App’s hot keys"
        LeftIcon={<WalletGreenIcon />}
        callback={navigateToWalletCreation}
      />
      <OptionCard
        title="2-of-3 Vault"
        description="Occasional use wallet"
        LeftIcon={<VaultGreenIcon />}
        callback={() => navigateToVaultSetup({ m: 2, n: 3 })}
      />

      <OptionCard
        title="3-of-5 Vault"
        description="Deep cold storage"
        LeftIcon={<VaultGreenIcon />}
        callback={() => navigateToVaultSetup({ m: 3, n: 5 })}
      />
      <OptionCard
        title="Collaborative"
        description="With contacts/devices"
        LeftIcon={<CollaborativeIcon />}
        callback={handleCollaaborativeWalletCreation}
      />
    </Box>
  );
}

export default Wallets;
