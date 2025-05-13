import React, { useContext } from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/constants/responsive';
import InheritanceHeader from '../InheritanceHeader';
import DashedButton from 'src/components/DashedButton';
import { useNavigation } from '@react-navigation/native';
import GenerateRecoveryInstrcutionsPDF from 'src/utils/GenerateRecoveryInstrcutionsPDF';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { useSelector } from 'react-redux';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';

function RecoveryInstruction({}) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning } = translations;
  const themeMode = useSelector((state: any) => state?.settings?.themeMode);
  const privateTheme = themeMode === 'PRIVATE';
  const PrivateThemeLight = themeMode === 'PRIVATE_LIGHT';

  return (
    <ScreenWrapper
      barStyle="dark-content"
      backgroundcolor={
        privateTheme || PrivateThemeLight
          ? `${colorMode}.primaryBackground`
          : `${colorMode}.pantoneGreen`
      }
    >
      <InheritanceHeader />
      <ScrollView contentContainerStyle={styles.marginLeft}>
        <Text
          style={styles.heading}
          color={PrivateThemeLight ? `${colorMode}.textBlack` : `${colorMode}.headerWhite`}
        >
          {inheritancePlanning.recoveryInstructionsTitle}
        </Text>
        <Text
          style={styles.description}
          color={PrivateThemeLight ? `${colorMode}.textBlack` : `${colorMode}.headerWhite`}
        >
          {inheritancePlanning.recoveryInstructionsDescp}
        </Text>
        <Text
          style={styles.commonTextStyle}
          color={PrivateThemeLight ? `${colorMode}.textBlack` : `${colorMode}.headerWhite`}
        >
          {inheritancePlanning.recoveryInstructionsP1}
        </Text>
        <Text
          style={styles.commonTextStyle}
          color={PrivateThemeLight ? `${colorMode}.textBlack` : `${colorMode}.headerWhite`}
        >
          {inheritancePlanning.recoveryInstructionsP2}
        </Text>
        <Box style={styles.circleStyle}>
          <ThemedSvg name={'inheritance_recovery_illustration'} />
        </Box>

        <Box mt={5}>
          <DashedButton
            icon={<ThemedSvg name={'inheritance_down_arrow'} />}
            description={inheritancePlanning.recoveryInstructionsCtaDescp}
            callback={() => {
              GenerateRecoveryInstrcutionsPDF().then((res) => {
                if (res) {
                  navigation.navigate('PreviewPDF', { source: res });
                }
              });
            }}
            name={inheritancePlanning.recoveryInstructionsCtaTitle}
            hexagonBackgroundColor={'transparent'}
          />
        </Box>

        <Box style={[styles.leftTextStyle]}>
          <Text
            bold
            color={PrivateThemeLight ? `${colorMode}.textBlack` : `${colorMode}.headerWhite`}
          >
            Note:
          </Text>
          <Text color={PrivateThemeLight ? `${colorMode}.textBlack` : `${colorMode}.headerWhite`}>
            {inheritancePlanning.recoveryInstructionsNotes}
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
  marginLeft: {
    marginLeft: wp(10),
  },
  walletType: {
    justifyContent: 'space-between',
    gap: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
  },
  commonTextStyle: {
    marginTop: hp(40),
  },
  addContainer: {
    marginTop: hp(100),
    gap: 10,
  },
  leftTextStyle: {
    textAlign: 'left',
    marginTop: hp(40),
  },
  circleStyle: {
    alignItems: 'center',
    marginTop: hp(20),
  },
});

export default RecoveryInstruction;
