import { Box, View } from 'native-base';
import React, { useState } from 'react';
import OptionCard from 'src/components/OptionCard';
import WalletGreenIcon from 'src/assets/images/wallet_green.svg';
import VaultGreenIcon from 'src/assets/images/vault_green.svg';
import CollaborativeIcon from 'src/assets/images/collaborative_vault.svg';
import useWallets from 'src/hooks/useWallets';
import { WalletType } from 'src/services/wallets/enums';
import { CommonActions } from '@react-navigation/native';
import { VaultScheme } from 'src/services/wallets/interfaces/vault';
import usePlan from 'src/hooks/usePlan';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import KeeperModal from 'src/components/KeeperModal';
import SignerCard from '../AddSigner/SignerCard';
import AirGappedIcon from 'src/assets/images/airgapped.svg';
import HotWalletIcon from 'src/assets/images/hotWallet.svg';

enum SingleKeyOptions {
  HOT_WALLET = 'HOT_WALLET',
  AIR_GAPPED = 'AIR_GAPPED',
}
function Wallets({ navigation }) {
  const { wallets } = useWallets({ getAll: true });
  const { plan } = usePlan();
  const isDiamondHand = plan === SubscriptionTier.L3.toUpperCase();

  const [singleKeyOptions, setSingleKeyOptions] = useState(false);
  const [selectedSingleKeyOption, setselectedSingleKeyOption] = useState(
    SingleKeyOptions.HOT_WALLET
  );

  const handleSingleKey = () => {
    setSingleKeyOptions(false);
    if (selectedSingleKeyOption === SingleKeyOptions.HOT_WALLET) {
      navigateToWalletCreation();
    } else {
      navigation.navigate('AddSigningDevice', { scheme: { m: 1, n: 1 }, isSSAddition: true });
    }
  };

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

  const options = [
    {
      name: SingleKeyOptions.HOT_WALLET,
      title: 'Hot wallet',
      icon: <HotWalletIcon />,
      subTitle: 'key on the app',
    },
    {
      name: SingleKeyOptions.AIR_GAPPED,
      title: 'Air Gapped',
      icon: <AirGappedIcon />,
      subTitle: 'Choose a key',
    },
  ];

  const Content = () => {
    return (
      <View
        style={{
          marginVertical: 5,
          gap: 2,
          flexDirection: 'row',
        }}
      >
        {options &&
          options.map((option) => (
            <SignerCard
              key={option.name}
              isSelected={selectedSingleKeyOption === option.name}
              isFullText={true}
              name={option.title}
              subtitle={option.subTitle}
              icon={option.icon}
              onCardSelect={() => {
                setselectedSingleKeyOption(option.name);
              }}
              colorMode="light"
            />
          ))}
      </View>
    );
  };

  return (
    <Box>
      <OptionCard
        title="Single-key wallet"
        description="Create a Hot Wallet or an Air-gapped Wallet"
        LeftIcon={<WalletGreenIcon />}
        callback={() => setSingleKeyOptions(true)}
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
      <KeeperModal
        visible={singleKeyOptions}
        close={() => setSingleKeyOptions(false)}
        title={'Single-key wallet'}
        subTitle={'Create a Hot Wallet or an Air-gapped Wallet'}
        buttonText={'Proceed'}
        buttonCallback={handleSingleKey}
        Content={Content}
      />
    </Box>
  );
}

export default Wallets;
