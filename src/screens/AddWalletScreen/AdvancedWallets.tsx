import { Box, useColorMode } from 'native-base';
import React from 'react';
import OptionCard from 'src/components/OptionCard';
import TimeLockIcon from 'src/assets/images/calendar_disabled.svg';
import MultiSigIcon from 'src/assets/images/degrading_multisig_disabled.svg';
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
            backgroundColor={`${colorMode}.greenPillBackground`}
            headingColor={`${colorMode}.white`}
          />
        }
        callback={() => {}}
        disabled
      />
      <OptionCard
        title="Degrading Multisig"
        description="Degrading multi-key wallet"
        LeftIcon={<MultiSigIcon />}
        titleColor={`${colorMode}.primaryText`}
        descriptionColor={`${colorMode}.secondaryText`}
        CardPill={
          <CardPill
            heading="COMING SOON"
            backgroundColor={`${colorMode}.greenPillBackground`}
            headingColor={`${colorMode}.white`}
          />
        }
        callback={() => {}}
        disabled
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
