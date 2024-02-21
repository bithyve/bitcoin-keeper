import { Box, ScrollView } from 'native-base';
import React from 'react';
import OptionCard from 'src/components/OptionCard';
import WalletGreenIcon from 'src/assets/images/wallet_green.svg';
import VaultGreenIcon from 'src/assets/images/vault_green.svg';
import Sword from 'src/assets/images/sword_icon.svg';
import useWallets from 'src/hooks/useWallets';
import { WalletType } from 'src/core/wallets/enums';
import { CommonActions } from '@react-navigation/native';
import { VaultScheme } from 'src/core/wallets/interfaces/vault';

function InheritanceTool({ navigation }) {
  const { wallets } = useWallets({ getAll: true });

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
    <ScrollView>
      <OptionCard
        title="Inheritance Key"
        description="Additional signer for your vault"
        LeftIcon={<Sword />}
        callback={navigateToWalletCreation}
      />
      <OptionCard
        title="Letter to Attorney"
        description="A pre-filled letter template"
        LeftIcon={<Sword />}
        callback={() => navigateToVaultSetup({ m: 2, n: 3 })}
      />
      <OptionCard
        title="Recovery Instructions"
        description="For the heir or beneficiary"
        LeftIcon={<VaultGreenIcon />}
        callback={() => navigateToVaultSetup({ m: 3, n: 5 })}
      />
      <OptionCard
        title="Printable Templates"
        description="For digital or physical copies"
        LeftIcon={<VaultGreenIcon />}
        callback={handleCollaaborativeWalletCreation}
      />
      <Box paddingTop={10}>
        <OptionCard
          title="Inheritance Tips"
          description="Lorem ipsum dolor sit amet,"
          LeftIcon={<VaultGreenIcon />}
          callback={handleCollaaborativeWalletCreation}
        />
      </Box>
    </ScrollView>
  );
}

export default InheritanceTool;
