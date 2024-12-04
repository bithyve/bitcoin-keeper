import { Box, useColorMode } from 'native-base';
import React, { useContext } from 'react';
import OptionCard from 'src/components/OptionCard';
import TimeLockIcon from 'src/assets/images/calendar.svg';
import AssistedVaultIcon from 'src/assets/images/assisted-vault-icon.svg';
import TimeLockDisabledIcon from 'src/assets/images/calendar-disabled.svg';
import AssistedVaultDisabledIcon from 'src/assets/images/assisted-vault-disabled-icon.svg';
import VaultGreenIcon from 'src/assets/images/vault_green.svg';
import { CommonActions } from '@react-navigation/native';
import CardPill from 'src/components/CardPill';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import SignerImportIcon from 'src/assets/images/signer_import.svg';

function AdvancedWallets({ navigation }) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { importWallet } = translations;
  const isDisbaled = true;
  const navigateToVaultSetup = (scheme?, isTimeLock = false) => {
    navigation.dispatch(
      CommonActions.navigate({ name: 'VaultSetup', params: { scheme, isTimeLock } })
    );
  };

  return (
    <Box>
      <OptionCard
        disabled={isDisbaled}
        title="Time Lock"
        description="For 3, 6 or 12 months"
        LeftIcon={isDisbaled ? <TimeLockDisabledIcon /> : <TimeLockIcon />}
        titleColor={`${colorMode}.primaryText`}
        descriptionColor={`${colorMode}.secondaryText`}
        callback={() => navigateToVaultSetup({ m: 2, n: 3 }, true)}
        CardPill={
          <CardPill
            heading="COMING SOON"
            backgroundColor={`${colorMode}.greenPillBackground`}
            headingColor={`${colorMode}.white`}
          />
        }
      />
      <OptionCard
        disabled={isDisbaled}
        title="Assisted Wallet"
        description={`Create degrading mulit-key\nwallet with friends or advisors`}
        LeftIcon={isDisbaled ? <AssistedVaultDisabledIcon /> : <AssistedVaultIcon />}
        titleColor={`${colorMode}.primaryText`}
        descriptionColor={`${colorMode}.secondaryText`}
        callback={() => {
          navigation.navigate('AssistedWalletTimeline');
        }}
        CardPill={
          <CardPill
            heading="COMING SOON"
            backgroundColor={`${colorMode}.greenPillBackground`}
            headingColor={`${colorMode}.white`}
          />
        }
      />
      <OptionCard
        title="Custom Multisig"
        description="Custom multi-key"
        LeftIcon={<VaultGreenIcon />}
        callback={() => navigateToVaultSetup()}
      />
      <OptionCard
        title={importWallet.importVaultFromSigner}
        description={importWallet.importVaultFromSignerSubtitle}
        LeftIcon={<SignerImportIcon />}
        callback={() => navigation.navigate('SigningDeviceConfigRecovery')}
      />
    </Box>
  );
}

export default AdvancedWallets;
