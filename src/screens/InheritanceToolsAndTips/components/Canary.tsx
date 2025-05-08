import React, { useContext } from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/constants/responsive';
import InheritanceHeader from '../InheritanceHeader';
import DashedButton from 'src/components/DashedButton';
import { CommonActions } from '@react-navigation/native';
import CanaryIcon from 'src/assets/images/canary-wallets.svg';
import PrivateCanaryIcon from 'src/assets/privateImages/canary-wallet-illustration.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { useSelector } from 'react-redux';
import Colors from 'src/theme/Colors';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';

function CanaryWallets({ navigation }) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning, common, wallet } = translations;
  const themeMode = useSelector((state: any) => state?.settings?.themeMode);
  const privateTheme = themeMode === 'PRIVATE';
  const privateThemeLight = themeMode === 'PRIVATE_LIGHT';

  return (
    <ScreenWrapper
      barStyle="dark-content"
      backgroundcolor={
        privateTheme || privateThemeLight
          ? `${colorMode}.primaryBackground`
          : `${colorMode}.pantoneGreen`
      }
    >
      <InheritanceHeader />
      <ScrollView>
        <Text
          style={styles.heading}
          color={privateThemeLight ? `${colorMode}.textBlack` : `${colorMode}.headerWhite`}
        >
          {inheritancePlanning.canaryWallet}
        </Text>
        <Text
          style={styles.description}
          color={privateThemeLight ? `${colorMode}.textBlack` : `${colorMode}.headerWhite`}
        >
          {inheritancePlanning.canaryWalletDesp}
        </Text>
        <Text
          style={styles.commonTextStyle}
          color={privateThemeLight ? `${colorMode}.textBlack` : `${colorMode}.headerWhite`}
        >
          {inheritancePlanning.canaryWalletDescp1}
        </Text>

        <Box style={styles.circleStyle}>
          <ThemedSvg name={'canary_illustration'} />
        </Box>
        <Text
          style={styles.commonTextStyle}
          color={privateThemeLight ? `${colorMode}.textBlack` : `${colorMode}.headerWhite`}
        >
          {inheritancePlanning.canaryWalletDescp2}
        </Text>
        <Box mt={5}>
          <DashedButton
            description={inheritancePlanning.canaryWalletCtaDescp}
            callback={() =>
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'Home',
                      params: { selectedOption: wallet.keys },
                    },
                  ],
                })
              )
            }
            name={inheritancePlanning.canaryWalletCtaHeading}
            icon={<ThemedSvg name={'canary_keys_icon'} width={20} height={20} />}
            hexagonBackgroundColor={privateThemeLight ? Colors.secondaryBlack : Colors.headerWhite}
          />
        </Box>
        <Box style={styles.leftTextStyle}>
          <Text
            bold
            color={privateThemeLight ? `${colorMode}.textBlack` : `${colorMode}.headerWhite`}
          >
            {`${common.note}:`}
          </Text>
          <Text color={privateThemeLight ? `${colorMode}.textBlack` : `${colorMode}.headerWhite`}>
            {inheritancePlanning.canaryWalletDescp3}
          </Text>
        </Box>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 25,
    marginTop: 20,
  },
  walletType: {
    justifyContent: 'space-between',
    gap: 10,
  },
  heading: {
    fontWeight: '500',
    fontSize: 18,
  },
  description: {
    fontSize: 14,
  },
  commonTextStyle: {
    marginTop: hp(40),
  },
  circleStyle: {
    alignItems: 'center',
    marginTop: hp(20),
    marginRight: wp(25),
  },
  leftTextStyle: {
    textAlign: 'left',
    marginTop: hp(40),
  },
});

export default CanaryWallets;
