import { Box, useColorMode } from 'native-base';
import React from 'react';
import OptionCard from 'src/components/OptionCard';
import TimeLockIcon from 'src/assets/images/calendar_disabled.svg';
import AssistedVaultIcon from 'src/assets/images/assisted-vault-icon.svg';
import VaultGreenIcon from 'src/assets/images/vault_green.svg';
import { CommonActions } from '@react-navigation/native';
import CardPill from 'src/components/CardPill';

function AdvancedWallets({ navigation }) {
  const { colorMode } = useColorMode();
  const navigateToVaultSetup = (scheme?) => {
    navigation.dispatch(CommonActions.navigate({ name: 'VaultSetup', params: { scheme } }));
  };

  return (
    <Box>
      <OptionCard
        title="Time Lock"
        description="For 3, 6 or 12 months"
        LeftIcon={<TimeLockIcon />}
        titleColor={`${colorMode}.primaryText`}
        descriptionColor={`${colorMode}.secondaryText`}
        CardPill={
          <CardPill
            heading="COMING SOON"
            backgroundColor={`${colorMode}.choosePlanCard`}
            headingColor={`${colorMode}.white`}
          />
        }
        callback={() => {}}
        disabled
      />
      <OptionCard
        title="Assisted Wallet"
        description="Create degrading Multisig with advisors"
        LeftIcon={<AssistedVaultIcon />}
        titleColor={`${colorMode}.primaryText`}
        descriptionColor={`${colorMode}.secondaryText`}
        callback={() => {
          navigation.navigate('AssistedWalletTimeline');
        }}
      />
      <OptionCard
        title="Custom Multisig"
        description="Custom multi-key"
        LeftIcon={<VaultGreenIcon />}
        callback={() => navigateToVaultSetup()}
      />
    </Box>
  );
}

export default AdvancedWallets;
