import React, { useContext } from 'react';
import { useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { wp } from 'src/constants/responsive';
import TipsSlider from '../TipsSlider';
import InheritanceHeader from '../InheritanceHeader';

import Text from 'src/components/KeeperText';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { useSelector } from 'react-redux';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';

function InheritanceTips({}) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning } = translations;
  const themeMode = useSelector((state: any) => state?.settings?.themeMode);
  const privateTheme = themeMode === 'PRIVATE';
  const PrivateThemeLight = themeMode === 'PRIVATE_LIGHT';
  const tips = [
    {
      title: inheritancePlanning.documentMultiKeyTitle,
      icon: <ThemedSvg name={'multiKeySetupIcon_illustration'} />,
      paragraph2: inheritancePlanning.documentMultiKeyP2,
      paragraph: inheritancePlanning.documentMultiKeyP1,
    },
    {
      title: inheritancePlanning.educateHireTitle,
      icon: <ThemedSvg name={'educateHeir_illustration'} />,
      paragraph2: inheritancePlanning.educateHireP2,
      paragraph: inheritancePlanning.educateHireP1,
    },
    {
      title: inheritancePlanning.selectKnowledgeableTitle,
      icon: <ThemedSvg name={'knowledgeable_illustration'} />,
      paragraph2: inheritancePlanning.selectKnowledgeableP2,
      paragraph: inheritancePlanning.selectKnowledgeableP1,
    },
    {
      title: inheritancePlanning.regularUpdatesTitle,
      icon: <ThemedSvg name={'estatePlan_illustration'} />,
      paragraph2: inheritancePlanning.regularUpdatesP2,
      paragraph: inheritancePlanning.regularUpdatesP1,
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
        style={styles.marginLeft}
        color={PrivateThemeLight ? `${colorMode}.textBlack` : `${colorMode}.headerWhite`}
      >
        {inheritancePlanning.inheritanceTipsTitle}
      </Text>
      <TipsSlider items={tips} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  marginLeft: {
    marginLeft: wp(10),
  },
});

export default InheritanceTips;
