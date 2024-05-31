import React, { useContext } from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp } from 'src/constants/responsive';
import InheritanceHeader from '../InheritanceHeader';
import DashedButton from 'src/components/DashedButton';
import { CommonActions } from '@react-navigation/native';
import Chip from 'src/assets/images/chip.svg';
import CanaryIcon from 'src/assets/images/canary-wallets.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function CanaryWallets({ navigation }) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning } = translations;

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.modalGreenBackground`}>
      <InheritanceHeader />
      <ScrollView>
        <Text style={styles.heading} color={`${colorMode}.modalGreenContent`}>
          {inheritancePlanning.canaryWallet}
        </Text>
        <Text style={styles.description} color={`${colorMode}.modalGreenContent`}>
          {inheritancePlanning.canaryWalletDesp}
        </Text>
        <Text style={styles.commonTextStyle} color={`${colorMode}.modalGreenContent`}>
          {inheritancePlanning.canaryWalletDescp1}
        </Text>

        <Box style={styles.circleStyle}>
          <CanaryIcon />
        </Box>
        <Text style={styles.commonTextStyle} color={`${colorMode}.modalGreenContent`}>
          {inheritancePlanning.canaryWalletDescp2}
        </Text>
        <Box mt={5}>
          <DashedButton
            description={inheritancePlanning.canaryWalletCtaDescp}
            callback={() => navigation.dispatch(CommonActions.navigate({ name: 'ManageSigners' }))}
            name={inheritancePlanning.canaryWalletCtaHeading}
            icon={<Chip />}
          />
        </Box>
        <Text style={styles.commonTextStyle} color={`${colorMode}.modalGreenContent`}>
          {inheritancePlanning.canaryWalletDescp3}
        </Text>
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
  },
});

export default CanaryWallets;
