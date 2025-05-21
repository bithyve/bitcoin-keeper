import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { wp } from 'src/constants/responsive';
import TipsSlider from '../TipsSlider';
import InheritanceHeader from '../InheritanceHeader';
import Text from 'src/components/KeeperText';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';
import ThemedColor from 'src/components/ThemedColor/ThemedColor';

function InheritanceTips({}) {
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning } = translations;
  const slider_background = ThemedColor({ name: 'slider_background' });
  const green_modal_text_color = ThemedColor({ name: 'green_modal_text_color' });

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
    <ScreenWrapper barStyle="dark-content" backgroundcolor={slider_background}>
      <InheritanceHeader />
      <Text style={styles.marginLeft} color={green_modal_text_color}>
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
