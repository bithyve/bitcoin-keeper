import { Box, ScrollView } from 'native-base';
import React from 'react';
import OptionCard from 'src/components/OptionCard';
import WalletGreenIcon from 'src/assets/images/wallet_green.svg';
import VaultGreenIcon from 'src/assets/images/vault_green.svg';
import Bird from 'src/assets/images/bird.svg';
import useWallets from 'src/hooks/useWallets';
import { WalletType } from 'src/core/wallets/enums';
import { CommonActions } from '@react-navigation/native';
import { VaultScheme } from 'src/core/wallets/interfaces/vault';

function KeySecurity({ navigation }) {
  const { wallets } = useWallets({ getAll: true });

  const navigateToVaultSetup = (scheme: VaultScheme) => {
    navigation.dispatch(CommonActions.navigate({ name: 'VaultSetup', params: { scheme } }));
  };

  const navigateToDiscountCodes = () => {
    navigation.navigate('DiscountCodes');
  };

  const handleCollaaborativeWalletCreation = () => {
    navigation.navigate('SetupCollaborativeWallet');
  };

  const navigateToCanary = () => {
    navigation.navigate('CanaryWallets');
  };

  return (
    <ScrollView>
      <OptionCard
        title="Buy new Hardware Signers"
        description="Overview and discount codes"
        LeftIcon={<WalletGreenIcon />}
        callback={navigateToDiscountCodes}
      />
      <OptionCard
        title="Canary Wallets"
        description="Alert on key compromise"
        LeftIcon={<Bird />}
        callback={() => navigateToCanary()}
      />
      <OptionCard
        title="Assisted Keys"
        description="Assisted Keys"
        LeftIcon={<VaultGreenIcon />}
        callback={() => navigateToVaultSetup({ m: 3, n: 5 })}
      />
      <Box paddingTop={10}>
        <OptionCard
          title="Assisted Keys"
          description="Recommendations while transacting"
          LeftIcon={<VaultGreenIcon />}
          callback={handleCollaaborativeWalletCreation}
        />
        <OptionCard
          title="Safekeeping Tips"
          description="Key storage best practices"
          LeftIcon={<VaultGreenIcon />}
          callback={handleCollaaborativeWalletCreation}
        />
      </Box>
    </ScrollView>
  );
}

export default KeySecurity;
