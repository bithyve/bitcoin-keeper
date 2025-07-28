import { Box, ScrollView } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import { LocalizationContext } from 'src/context/Localization/LocContext';

import HardwareDevices from './components/HardwareDevices';
import HardwareReseller from './components/HardwareReseller';
import MonthlyYearlySwitch from 'src/components/Switch/MonthlyYearlySwitch';
import Relay from 'src/services/backend/Relay';
import { useAppSelector } from 'src/store/hooks';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';

const HardwareWallet = ({ navigation }) => {
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletText, common } = translations;
  const [isToggled, setIsToggled] = useState(false);
  const appId = useAppSelector((state) => state.storage.appId);
  const [sellers, setSellers] = useState([]);
  const [resellers, setResellers] = useState([]);
  const { showToast } = useToastMessage();

  useEffect(() => {
    const fetchHardwareReferralLinks = async () => {
      try {
        const result = await Relay.fetchHardwareReferralLinks(appId);
        if (result?.sellers) {
          setSellers(result.sellers);
        }
        if (result?.resellers) {
          setResellers(result.resellers);
        }
      } catch (error) {
        console.log('🚀 ~ fetchHardwareReferralLinks ~ error:', error);
        navigation.goBack();
        showToast(error?.message ?? common.somethingWrong, <ToastErrorIcon />);
      }
    };
    fetchHardwareReferralLinks();
  }, []);

  return (
    <ScreenWrapper>
      <Box>
        <WalletHeader title={walletText.hardwareShopWallet} />
      </Box>
      <MonthlyYearlySwitch
        title2="Resellers"
        title1="Devices"
        value={isToggled}
        onValueChange={() => setIsToggled(!isToggled)}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {!isToggled ? (
          <HardwareDevices sellers={sellers} />
        ) : (
          <HardwareReseller resellers={resellers} />
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

export default HardwareWallet;
