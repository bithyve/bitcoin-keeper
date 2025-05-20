import React, { useContext } from 'react';
import { useColorMode } from 'native-base';
import ScreenWrapper from 'src/components/ScreenWrapper';
import TipsSlider from '../TipsSlider';
import InheritanceHeader from '../InheritanceHeader';
import Text from 'src/components/KeeperText';
import { wp } from 'src/constants/responsive';
import { StyleSheet } from 'react-native';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { useSelector } from 'react-redux';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';

function SafeGuardingTips({}) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning } = translations;
  const themeMode = useSelector((state: any) => state?.settings?.themeMode);
  const privateTheme = themeMode === 'PRIVATE';
  const PrivateThemeLight = themeMode === 'PRIVATE_LIGHT';
  const tips = [
    {
      title: inheritancePlanning.thoroughVeirifcationTitle,
      icon: <ThemedSvg name={'inheritance_seed_illustration'} />,
      paragraph: inheritancePlanning.thoroughParagraph1,
      paragraph2: inheritancePlanning.thoroughParagraph2,
    },

    {
      title: inheritancePlanning.preliminaryTitle,
      icon: <ThemedSvg name={'restore_illustration'} />,
      paragraph: inheritancePlanning.preliminaryParagraph1,
      paragraph2: inheritancePlanning.preliminaryParagraph2,
    },
    {
      title: inheritancePlanning.secureCoordinationTitle,
      icon: <ThemedSvg name={'educateHeir_illustration'} />,
      paragraph: inheritancePlanning.secureCoordinationParagraph1,
      paragraph2: inheritancePlanning.secureCoordinationParagraph2,
    },
    {
      title: inheritancePlanning.crossDeviceTitle,
      icon: <ThemedSvg name={'backup_illustration'} />,
      paragraph: inheritancePlanning.crossDeviceParagraph1,
      paragraph2: inheritancePlanning.crossDeviceParagraph2,
    },
  ];

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
      <Text
        style={styles.container}
        color={PrivateThemeLight ? `${colorMode}.textBlack` : `${colorMode}.headerWhite`}
      >
        {inheritancePlanning.tipsForTransactions}
      </Text>
      <TipsSlider items={tips} />
    </ScreenWrapper>
  );
}

export default SafeGuardingTips;

const styles = StyleSheet.create({
  container: {
    marginLeft: wp(10),
  },
});
