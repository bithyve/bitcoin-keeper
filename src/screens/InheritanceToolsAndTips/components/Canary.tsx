import React, { useContext } from 'react';
import { Box, ScrollView } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/constants/responsive';
import InheritanceHeader from '../InheritanceHeader';
import DashedButton from 'src/components/DashedButton';
import { CommonActions } from '@react-navigation/native';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';
import ThemedColor from 'src/components/ThemedColor/ThemedColor';

function CanaryWallets({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning, common, wallet: walletText } = translations;
  const slider_background = ThemedColor({ name: 'slider_background' });
  const green_modal_text_color = ThemedColor({ name: 'green_modal_text_color' });
  const inheritancePlanning_hexagonBackgroundColor = ThemedColor({
    name: 'inheritancePlanning_hexagonBackgroundColor',
  });

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={slider_background}>
      <InheritanceHeader />
      <ScrollView>
        <Text style={styles.heading} color={green_modal_text_color}>
          {inheritancePlanning.canaryWallet}
        </Text>
        <Text style={styles.description} color={green_modal_text_color}>
          {inheritancePlanning.canaryWalletDesp}
        </Text>
        <Text style={styles.commonTextStyle} color={green_modal_text_color}>
          {inheritancePlanning.canaryWalletDescp1}
        </Text>

        <Box style={styles.circleStyle}>
          <ThemedSvg name={'canary_illustration'} />
        </Box>
        <Text style={styles.commonTextStyle} color={green_modal_text_color}>
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
                      params: { selectedOption: walletText.keys },
                    },
                  ],
                })
              )
            }
            name={inheritancePlanning.canaryWalletCtaHeading}
            icon={<ThemedSvg name={'canary_keys_icon'} width={20} height={20} />}
            hexagonBackgroundColor={inheritancePlanning_hexagonBackgroundColor}
          />
        </Box>
        <Box style={styles.leftTextStyle}>
          <Text bold color={green_modal_text_color}>
            {`${common.note}:`}
          </Text>
          <Text color={green_modal_text_color}>{inheritancePlanning.canaryWalletDescp3}</Text>
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
