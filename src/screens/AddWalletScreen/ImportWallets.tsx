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
        title={importWallet.watchOnly}
        description={importWallet.usingExternalHardware}
        LeftIcon={<WatchOnlyIcon />}
        callback={() => navigation.navigate('ImportWallet')}
      />
      <OptionCard
        title={importWallet.usingConfigFile}
        description={importWallet.insertTextfromFile}
        LeftIcon={<ConfigurationIcon />}
        callback={() => navigation.navigate('VaultConfigurationCreation')}
      />
      <OptionCard
        title="Use signers with vault registration"
        description="Coldcard, etc."
        LeftIcon={<SignerIcon />}
        callback={() => navigation.navigate('SigningDeviceConfigRecovery')}
      />
    </Box>
  );
}

export default ImportWallets;
