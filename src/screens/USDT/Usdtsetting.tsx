import React, { useContext } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import SettingCard from '../Home/components/Settings/Component/SettingCard';
import { Box, useColorMode } from 'native-base';
import { LocalizationContext } from 'src/context/Localization/LocContext';

const Usdtsetting = () => {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { usdtWalletText } = translations;

  const actions = [
    {
      title: usdtWalletText.walletDetails,
      description: usdtWalletText.walletNameAndDescription,
      onPress: () => {},
    },
    {
      title: usdtWalletText.hideWallet,
      description: usdtWalletText.hideWalletDesc,
      onPress: () => {},
    },
    {
      title: usdtWalletText.walletSeedWords,
      description: usdtWalletText.backupWalletOrExport,
      onPress: () => {},
    },
  ];
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
