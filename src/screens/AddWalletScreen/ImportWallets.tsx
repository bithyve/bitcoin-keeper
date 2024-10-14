import { Box } from 'native-base';
import React, { useContext } from 'react';
import OptionCard from 'src/components/OptionCard';
import WatchOnlyIcon from 'src/assets/images/watch_only.svg';
import ConfigurationIcon from 'src/assets/images/file.svg';
import SignerIcon from 'src/assets/images/signer.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function ImportWallets({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { importWallet } = translations;
  return (
    <Box>
      <OptionCard
        title={importWallet.usingConfigFile}
        description={importWallet.usingConfigFileSubtitle}
        LeftIcon={<ConfigurationIcon />}
        callback={() => navigation.navigate('VaultConfigurationCreation')}
      />
      <OptionCard
        title={importWallet.importXpub}
        description={importWallet.importXpubSubtitle}
        LeftIcon={<WatchOnlyIcon />}
        callback={() => navigation.navigate('ImportWallet')}
      />
      <OptionCard
        title={importWallet.importVaultFromSigner}
        description={importWallet.importVaultFromSignerSubtitle}
        LeftIcon={<SignerIcon />}
        callback={() => navigation.navigate('SigningDeviceConfigRecovery')}
      />
    </Box>
  );
}

export default ImportWallets;
