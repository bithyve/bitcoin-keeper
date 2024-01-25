import { Box } from 'native-base';
import React from 'react';
import OptionCard from 'src/components/OptionCard';
import WatchOnlyIcon from 'src/assets/images/watch_only.svg';
import ConfigurationIcon from 'src/assets/images/file.svg';
import SignerIcon from 'src/assets/images/signer.svg';

function ImportWallets({ navigation }) {
  return (
    <Box>
      <OptionCard
        title="Watch Only"
        description="Use external xPub"
        LeftIcon={<WatchOnlyIcon />}
        callback={() => navigation.navigate('ImportWallet')}
      />
      <OptionCard
        title="Wallet Configuration File"
        description="Text in your Recovery Instructions (Inheritance)"
        LeftIcon={<ConfigurationIcon />}
        callback={() => navigation.navigate('VaultConfigurationCreation')}
      />
      <OptionCard
        title="Signers with vault details"
        description="Signers registered with the vault"
        LeftIcon={<SignerIcon />}
        callback={() => navigation.navigate('SigningDeviceConfigRecovery')}
      />
    </Box>
  );
}

export default ImportWallets;
