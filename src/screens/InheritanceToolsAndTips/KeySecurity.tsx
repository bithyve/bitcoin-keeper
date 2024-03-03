import { Box, ScrollView } from 'native-base';
import React from 'react';
import OptionCard from 'src/components/OptionCard';
import WalletGreenIcon from 'src/assets/images/wallet_green.svg';
import VaultGreenIcon from 'src/assets/images/vault_green.svg';
import Bird from 'src/assets/images/bird.svg';

function KeySecurity({ navigation }) {
  const navigate = (path) => {
    navigation.navigate(path);
  };

  return (
    <ScrollView>
      <OptionCard
        title="Buy new Hardware Signers"
        description="Overview and discount codes"
        LeftIcon={<WalletGreenIcon />}
        callback={() => navigate('DiscountCodes')}
      />
      <OptionCard
        title="Canary Wallets"
        description="Alert on key compromise"
        LeftIcon={<Bird />}
        callback={() => navigate('CanaryWallets')}
      />
      <OptionCard
        title="Assisted Keys"
        description="Assisted Keys"
        LeftIcon={<VaultGreenIcon />}
        callback={() => navigate('AssistedKeys')}
      />
      <Box paddingTop={10}>
        <OptionCard
          title="Secure Usage Tips"
          description="Recommendations while transacting"
          LeftIcon={<VaultGreenIcon />}
          callback={() => navigate('SafeGuardingTips')}
        />
        <OptionCard
          title="Safekeeping Tips"
          description="Key storage best practices"
          LeftIcon={<VaultGreenIcon />}
          callback={() => navigate('SafeKeepingTips')}
        />
      </Box>
    </ScrollView>
  );
}

export default KeySecurity;
