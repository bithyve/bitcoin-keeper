import { Box } from 'native-base';
import React from 'react';
import OptionCard from 'src/components/OptionCard';
import WalletGreenIcon from 'src/assets/images/wallet_green.svg';
import VaultGreenIcon from 'src/assets/images/vault_green.svg';
import CollaborativeIcon from 'src/assets/images/collaborative_vault.svg';
import useCollaborativeWallet from 'src/hooks/useCollaborativeWallet';
import useWallets from 'src/hooks/useWallets';
import { NewWalletInfo } from 'src/store/sagas/wallets';
import { WalletType } from 'src/core/wallets/enums';
import { defaultTransferPolicyThreshold } from 'src/store/sagas/storage';
import { addNewWallets } from 'src/store/sagaActions/wallets';
import { useDispatch } from 'react-redux';
import { CommonActions } from '@react-navigation/native';
import { VaultScheme } from 'src/core/wallets/interfaces/vault';

const addNewDefaultWallet = (walletsCount, dispatch) => {
  const newWallet: NewWalletInfo = {
    walletType: WalletType.DEFAULT,
    walletDetails: {
      name: `Wallet ${walletsCount + 1} `,
      description: '',
      transferPolicy: {
        id: uuidv4(),
        threshold: defaultTransferPolicyThreshold,
      },
    },
  };
  dispatch(addNewWallets([newWallet]));
};

function Wallets({ navigation }) {
  const dispatch = useDispatch();
  const { wallets } = useWallets({ getAll: true });
  const { collaborativeWallets } = useCollaborativeWallet();
  const collaborativeWalletsCount = collaborativeWallets?.length || 0;
  const walletsCount = wallets.length;

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
    if (collaborativeWalletsCount < walletsCount) {
      navigation.navigate('SetupCollaborativeWallet', {
        coSigner: wallets[collaborativeWalletsCount],
        walletId: wallets[collaborativeWalletsCount].id,
        collaborativeWalletsCount,
      });
    } else {
      addNewDefaultWallet(wallets.length, dispatch);
    }
  };

  return (
    <Box>
      <OptionCard
        title="Hot Wallet"
        description="App’s Mobile Key"
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
function uuidv4(): string {
  throw new Error('Function not implemented.');
}
