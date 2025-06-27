import React from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import SettingCard from '../Home/components/Settings/Component/SettingCard';
import { Box, useColorMode } from 'native-base';

const Usdtsetting = () => {
  const { colorMode } = useColorMode();

  const actions = [
    {
      title: 'Wallet Details',
      description: 'Wallet name and description',
      onPress: () => {},
    },
    {
      title: 'Hide Wallet',
      description: 'Hidden wallets can be managed from Manage Wallets in settings',
      onPress: () => {},
    },
    {
      title: 'Wallet Seed Words',
      description: 'Ues to back up or export the wallet private key',
      onPress: () => {},
    },
  ];
  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader title="Wallet Settings" />
      <Box>
        {' '}
        <SettingCard
          subtitleColor={`${colorMode}.balanceText`}
          backgroundColor={`${colorMode}.textInputBackground`}
          borderColor={`${colorMode}.separator`}
          items={actions}
        />
      </Box>
    </ScreenWrapper>
  );
};

export default Usdtsetting;
