import React, { useContext } from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/constants/responsive';
import InheritanceHeader from '../InheritanceHeader';
import DashedButton from 'src/components/DashedButton';
import { CommonActions } from '@react-navigation/native';
import Chip from 'src/assets/images/chip.svg';
import CanaryIcon from 'src/assets/images/canary-wallets.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function CanaryWallets({ navigation }) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning, common } = translations;

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
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
        <Box style={styles.leftTextStyle}>
          <Text bold color={`${colorMode}.modalGreenContent`}>
            {`${common.note}:`}
          </Text>
          <Text color={`${colorMode}.modalGreenContent`}>
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
