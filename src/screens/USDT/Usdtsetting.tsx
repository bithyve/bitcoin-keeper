import React, { useContext } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import SettingCard from '../Home/components/Settings/Component/SettingCard';
import { Box, useColorMode } from 'native-base';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { USDTWallet } from 'src/services/wallets/factories/USDTWalletFactory';
import idx from 'idx';
import { useUSDTWallets } from 'src/hooks/useUSDTWallets';
import { VisibilityType } from 'src/services/wallets/enums';

const Usdtsetting = ({ route }) => {
  const { colorMode } = useColorMode();
  const { usdtWallet }: { usdtWallet: USDTWallet } = route.params;
  const seedWords = idx(usdtWallet, (_) => _.derivationDetails.mnemonic);
  const { updateWallet } = useUSDTWallets();
  const { translations } = useContext(LocalizationContext);
  const { usdtWalletText } = translations;

  const actions = [
    {
      title: usdtWalletText.walletDetails,
      description: usdtWalletText.walletNameAndDescription,
      onPress: () => {
        console.log(
          `USDT wallet details: ${usdtWallet.presentationData.name}, ${usdtWallet.presentationData.description}`
        );
      },
    },
    {
      title: usdtWalletText.hideWallet,
      description: usdtWalletText.hideWalletDesc,
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
      <WalletHeader title={usdtWalletText.walletSetting} />
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
