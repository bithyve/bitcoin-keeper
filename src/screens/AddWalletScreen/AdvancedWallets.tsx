import { Box } from 'native-base';
import React from 'react';
import OptionCard from 'src/components/OptionCard';
import TimeLockIcon from 'src/assets/images/calendar.svg';
import MultiSigIcon from 'src/assets/images/advanced_green.svg';
import VaultGreenIcon from 'src/assets/images/vault_green.svg';
import { CommonActions } from '@react-navigation/native';

function AdvancedWallets({ navigation }) {
  const navigateToVaultSetup = (scheme?) => {
    navigation.dispatch(CommonActions.navigate({ name: 'VaultSetup', params: { scheme } }));
  };

  return (
    <Box>
      <OptionCard
        title="Time Lock"
        description="For 3, 6 or 12 months"
        LeftIcon={<TimeLockIcon />}
        callback={() => navigateToVaultSetup()}
        disabled
      />
      <OptionCard
        title="Degrading Multi-sig"
        description="Time based sig"
        LeftIcon={<MultiSigIcon />}
        callback={() => navigateToVaultSetup()}
        disabled
      />
      <OptionCard
        title="Custom Multi-sig"
        description="Build your own"
        LeftIcon={<VaultGreenIcon />}
        callback={() => navigateToVaultSetup({ m: 3, n: 6 })}
      />
    </Box>
  );
}

export default AdvancedWallets;
