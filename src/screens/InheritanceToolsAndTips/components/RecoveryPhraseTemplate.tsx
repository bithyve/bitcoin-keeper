import React, { useContext } from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/constants/responsive';
import InheritanceHeader from '../InheritanceHeader';
import DashedButton from 'src/components/DashedButton';
import { useNavigation } from '@react-navigation/native';
import GenerateRecoveryPhraseTemplate from 'src/utils/GenerateRecoveryPhraseTemplate';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { useSelector } from 'react-redux';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';

function RecoveryPhraseTemplate({}) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning, common } = translations;
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
          {inheritancePlanning.recoveryPhraseTitleTemplate}
        </Text>
        <Text
          style={styles.description}
          color={PrivateThemeLight ? `${colorMode}.textBlack` : `${colorMode}.headerWhite`}
        >
          {inheritancePlanning.recoveryPhraseDescpMain}
        </Text>
        <Text
          style={styles.commonTextStyle}
          color={PrivateThemeLight ? `${colorMode}.textBlack` : `${colorMode}.headerWhite`}
        >
          {inheritancePlanning.recoveryPhraseP1}
        </Text>
        <Box style={styles.circleStyle}>
          <ThemedSvg name={'inheritance_seed_illustration'} />
        </Box>
        <Text
          style={styles.commonTextStyle}
          color={PrivateThemeLight ? `${colorMode}.textBlack` : `${colorMode}.headerWhite`}
        >
          {inheritancePlanning.recoveryPhraseP2}
        </Text>
        <Box mt={5}>
          <DashedButton
            icon={<ThemedSvg name={'inheritance_down_arrow'} />}
            callback={() => {
              GenerateRecoveryPhraseTemplate().then((res) => {
                if (res) {
                  navigation.navigate('PreviewPDF', { source: res });
                }
              });
            }}
            name={inheritancePlanning.recoveryPhraseTemplateCtaTitle}
            hexagonBackgroundColor={'transparent'}
          />
        </Box>

        <Box style={[styles.leftTextStyle]}>
          <Text
            bold
            color={PrivateThemeLight ? `${colorMode}.textBlack` : `${colorMode}.headerWhite`}
          >
            {common.note}:
          </Text>
          <Text color={PrivateThemeLight ? `${colorMode}.textBlack` : `${colorMode}.headerWhite`}>
            {inheritancePlanning.recoveryPhraseNotes}
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

export default RecoveryPhraseTemplate;
