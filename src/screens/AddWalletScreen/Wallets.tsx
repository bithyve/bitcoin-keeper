import { Box, useColorMode, View } from 'native-base';
import React, { useState } from 'react';
import OptionCard from 'src/components/OptionCard';
import WalletGreenIcon from 'src/assets/images/wallet_green.svg';
import VaultGreenIcon from 'src/assets/images/vault_green.svg';
import CollaborativeIcon from 'src/assets/images/collaborative_vault.svg';
import useWallets from 'src/hooks/useWallets';
import { WalletType } from 'src/services/wallets/enums';
import { CommonActions } from '@react-navigation/native';
import { VaultScheme } from 'src/services/wallets/interfaces/vault';
import KeeperModal from 'src/components/KeeperModal';
import AirGappedIcon from 'src/assets/images/airgapped.svg';
import HotWalletIcon from 'src/assets/images/hotWallet.svg';
import { useDispatch } from 'react-redux';
import { resetCollaborativeSession } from 'src/store/reducers/vaults';
import SignerCard from '../AddSigner/SignerCard';
import { useAppSelector } from 'src/store/hooks';

enum SingleKeyOptions {
  HOT_WALLET = 'HOT_WALLET',
  AIR_GAPPED = 'AIR_GAPPED',
}
function Wallets({ navigation }) {
  const { wallets } = useWallets({ getAll: true });
  const { collaborativeSession } = useAppSelector((state) => state.vault);
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();

  const [singleKeyOptions, setSingleKeyOptions] = useState(false);
  const [collabSessionExistsModalVisible, setCollabSessionExistsModalVisible] = useState(false);
  const [selectedSingleKeyOption, setselectedSingleKeyOption] = useState(
    SingleKeyOptions.HOT_WALLET
  );

  const handleSingleKey = () => {
    setSingleKeyOptions(false);
    navigateToWalletCreation();
  };

  const navigateToVaultSetup = (scheme: VaultScheme) => {
    navigation.dispatch(CommonActions.navigate({ name: 'VaultSetup', params: { scheme } }));
  };

  const navigateToWalletCreation = () => {
    const isHotWallet = selectedSingleKeyOption === SingleKeyOptions.HOT_WALLET;
    navigation.navigate('EnterWalletDetail', {
      name: isHotWallet ? `Wallet ${wallets.length + 1}` : '',
      description: '',
      type: WalletType.DEFAULT,
      isHotWallet,
    });
  };

  const handleCollaborativeWalletCreation = () => {
    if (Object.keys(collaborativeSession.signers).length > 0) {
      setCollabSessionExistsModalVisible(true);
    } else {
      dispatch(resetCollaborativeSession());
      setTimeout(() => {
        navigation.navigate('SetupCollaborativeWallet');
      }, 500); // delaying navigation by 0.5 second to ensure collaborative session reset
    }
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
      title: 'Cold wallet',
      icon: <AirGappedIcon />,
      subTitle: 'Choose a key',
    },
  ];

  function Content() {
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
              colorMode={colorMode}
            />
          ))}
      </View>
    );
  }

  return (
    <Box>
      <OptionCard
        title="Single-key wallet"
        description="Create a wallet using a single key"
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
        title="Collaborative Vault"
        description="Simple 2-of-3 wallet with friends"
        LeftIcon={<CollaborativeIcon />}
        callback={handleCollaborativeWalletCreation}
      />
      <KeeperModal
        visible={singleKeyOptions}
        close={() => setSingleKeyOptions(false)}
        title="Single-key wallet"
        subTitle="Create a wallet using a single key"
        buttonText="Proceed"
        buttonCallback={handleSingleKey}
        Content={Content}
      />
      <KeeperModal
        visible={collabSessionExistsModalVisible}
        close={() => setCollabSessionExistsModalVisible(false)}
        title="Collaborative wallet setup session already exists"
        subTitle="You already have a collaborative wallet setup session in progress, would you like to continue the session or start a new one?"
        buttonText="Continue session"
        secondaryButtonText="Start new"
        secondaryCallback={() => {
          setCollabSessionExistsModalVisible(false);
          dispatch(resetCollaborativeSession());
          setTimeout(() => {
            navigation.navigate('SetupCollaborativeWallet');
          }, 500);
        }}
        buttonCallback={() => {
          setCollabSessionExistsModalVisible(false);
          navigation.navigate('SetupCollaborativeWallet');
        }}
      />
    </Box>
  );
}

export default Wallets;
