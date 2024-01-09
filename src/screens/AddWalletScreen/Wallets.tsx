import { Box } from 'native-base';
import React from 'react';
import OptionCard from 'src/components/OptionCard';
import WalletGreenIcon from 'src/assets/images/wallet_green.svg';
import VaultGreenIcon from 'src/assets/images/vault_green.svg';

function Wallets({ navigation }) {
  return (
    <Box>
      <OptionCard
        title="Hot Wallet"
        description="App’s Mobile Key"
        LeftIcon={<WalletGreenIcon />}
        callback={() => navigation.navigate('NodeSettings')}
      />
      <OptionCard
        title="2 of 3 Multi sig"
        description="Occasional use wallet"
        LeftIcon={<VaultGreenIcon />}
        callback={() => navigation.navigate('NodeSettings')}
      />
      <OptionCard
        title="3 of 5 Multi sig"
        description="Deep cold storage"
        LeftIcon={<VaultGreenIcon />}
        callback={() => navigation.navigate('NodeSettings')}
      />
      <OptionCard
        title="Collaborative"
        description="With contacts/ devices"
        LeftIcon={<WalletGreenIcon />}
        callback={() => navigation.navigate('NodeSettings')}
      />
    </Box>
  );
}

export default Wallets;
