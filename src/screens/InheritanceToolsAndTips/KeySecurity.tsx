import { Box, ScrollView } from 'native-base';
import React from 'react';
import OptionCard from 'src/components/OptionCard';
import WalletGreenIcon from 'src/assets/images/wallet_green.svg';
import VaultGreenIcon from 'src/assets/images/vault_green.svg';
import Bird from 'src/assets/images/bird.svg';

function KeySecurity({ navigation }) {
  const navigateToDiscountCodes = () => {
    navigation.navigate('DiscountCodes');
  };

  const handleCollaaborativeWalletCreation = () => {
    navigation.navigate('SetupCollaborativeWallet');
  };

  const navigateToCanary = () => {
    navigation.navigate('CanaryWallets');
  };
  const navigateToAssistedKeys = () => {
    navigation.navigate('AssistedKeys');
  };
  const navigateToSafeKeepingTips = () => {
    navigation.navigate('SafeKeepingTips');
  };
  const navigateToSafeGuardingTips = () => {
    navigation.navigate('SafeGuardingTips');
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
        callback={() => navigateToAssistedKeys()}
      />
      <Box paddingTop={10}>
        <OptionCard
          title="Secure Usage Tips"
          description="Recommendations while transacting"
          LeftIcon={<VaultGreenIcon />}
          callback={navigateToSafeGuardingTips}
        />
        <OptionCard
          title="Safekeeping Tips"
          description="Key storage best practices"
          LeftIcon={<VaultGreenIcon />}
          callback={navigateToSafeKeepingTips}
        />
      </Box>
    </ScrollView>
  );
}

export default KeySecurity;
