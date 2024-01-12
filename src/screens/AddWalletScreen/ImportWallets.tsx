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
        callback={() => navigation.navigate('NodeSettings')}
      />
      <OptionCard
        title="Vault Configuration File"
        description="Text in your Recovery Instructions (Inheritance)"
        LeftIcon={<ConfigurationIcon />}
        callback={() => navigation.navigate('NodeSettings')}
      />
      <OptionCard
        title="Signers with Vault details"
        description="Signers registered with the Vault"
        LeftIcon={<SignerIcon />}
        callback={() => navigation.navigate('NodeSettings')}
      />
    </Box>
  );
}

export default ImportWallets;
