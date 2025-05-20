import { Box, ScrollView } from 'native-base';
import React, { useContext, useState } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import { LocalizationContext } from 'src/context/Localization/LocContext';

import HardwareDevices from './components/HardwareDevices';
import HardwareReseller from './components/HardwareReseller';

const HardwareWallet = () => {
  const { translations } = useContext(LocalizationContext);
  const { wallet, common } = translations;
  const [isToggled, setIsToggled] = useState(false);

  return (
    <ScreenWrapper>
      <Box>
        <WalletHeader title={wallet.hardwareShopWallet} />
      </Box>
      {/* <MonthlyYearlySwitch
        title2="Resellers"
        title1="Devices"
        value={isToggled}
        onValueChange={() => setIsToggled(!isToggled)}
      /> */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {!isToggled ? <HardwareDevices /> : <HardwareReseller />}
      </ScrollView>
    </ScreenWrapper>
  );
};

export default HardwareWallet;
