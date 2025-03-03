import { Box, ScrollView, useColorMode } from 'native-base';
import React, { useContext, useState } from 'react';
import { StyleSheet } from 'react-native';
import Buttons from 'src/components/Buttons';
import ScreenWrapper from 'src/components/ScreenWrapper';
import MonthlyYearlySwitch from 'src/components/Switch/MonthlyYearlySwitch';
import WalletHeader from 'src/components/WalletHeader';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import usePlan from 'src/hooks/usePlan';
import UpgradeIcon from 'src/assets/images/upgrade-circle-icon.svg';
import { useNavigation } from '@react-navigation/native';
import HardwareDevices from './components/HardwareDevices';
import HardwareReseller from './components/HardwareReseller';

const HardwareWallet = () => {
  const { translations } = useContext(LocalizationContext);
  const { wallet, common } = translations;
  const navigation = useNavigation();
  const { isOnL1 } = usePlan();
  const { colorMode } = useColorMode();
  const [isToggled, setIsToggled] = useState(false);

  return (
    <ScreenWrapper>
      <Box>
        <WalletHeader title={wallet.hardwareShopWallet} />
      </Box>
      <MonthlyYearlySwitch
        title2="Resellers"
        title1="Devices"
        value={isToggled}
        onValueChange={() => setIsToggled(!isToggled)}
      />
      {isOnL1 && (
        <Box style={styles.plancontainer}>
          <Buttons
            fullWidth
            primaryFontWeight="medium"
            primaryText={common.upgrade}
            paddingVertical={wp(12)}
            borderRadius={5}
            primaryBackgroundColor={`${colorMode}.brownColor`}
            LeftIcon={UpgradeIcon}
            primaryCallback={() => {
              navigation.navigate('ChoosePlan');
            }}
          />
        </Box>
      )}
      <ScrollView showsVerticalScrollIndicator={false}>
        {!isToggled ? <HardwareDevices /> : <HardwareReseller />}
      </ScrollView>
    </ScreenWrapper>
  );
};

export default HardwareWallet;

const styles = StyleSheet.create({
  plancontainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: hp(10),
    marginBottom: hp(14),
  },
});
