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
        description="Text in your Recovery Instructions"
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
