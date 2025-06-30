import React from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import SettingCard from '../Home/components/Settings/Component/SettingCard';
import { Box, useColorMode } from 'native-base';
import { USDTWallet } from 'src/services/wallets/factories/USDTWalletFactory';
import idx from 'idx';
import { useUSDTWallets } from 'src/hooks/useUSDTWallets';
import { VisibilityType } from 'src/services/wallets/enums';

const Usdtsetting = ({ route }) => {
  const { colorMode } = useColorMode();
  const { usdtWallet }: { usdtWallet: USDTWallet } = route.params;
  const seedWords = idx(usdtWallet, (_) => _.derivationDetails.mnemonic);
  const { updateWallet } = useUSDTWallets();

  const actions = [
    {
      title: 'Wallet Details',
      description: 'Wallet name and description',
      onPress: () => {
        console.log(
          `USDT wallet details: ${usdtWallet.presentationData.name}, ${usdtWallet.presentationData.description}`
        );
      },
    },
    {
      title: 'Hide Wallet',
      description: 'Hidden wallets can be managed from Manage Wallets in settings',
      onPress: () => {
        const updatedWallet: USDTWallet = {
          ...usdtWallet,
          presentationData: {
            ...usdtWallet.presentationData,
            visibility: VisibilityType.HIDDEN,
          },
        };
        updateWallet(updatedWallet);
      },
    },
  ];

  if (seedWords) {
    actions.push({
      title: 'Wallet Seed Words',
      description: 'Use to back up or export the wallet private key',
      onPress: () => {
        console.log(`USDT wallet seed words: ${seedWords}`);
      },
    });
  }

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
