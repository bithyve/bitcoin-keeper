import React, { useContext } from 'react';
import { useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { wp } from 'src/constants/responsive';
import TipsSlider from '../TipsSlider';
import InheritanceHeader from '../InheritanceHeader';
import MultiKeySetupIcon from 'src/assets/images/document_multi_key_setup.svg';
import EducateHierIcon from 'src/assets/images/educate_hier.svg';
import SelectKnowledgeIcon from 'src/assets/images/select_knowledge.svg';
import RegularUpdateIcon from 'src/assets/images/regular_update_icon.svg';

import Text from 'src/components/KeeperText';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function InheritanceTips({}) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning } = translations;
  const tips = [
    {
      title: inheritancePlanning.documentMultiKeyTitle,
      icon: <MultiKeySetupIcon />,
      paragraph2: inheritancePlanning.documentMultiKeyP2,
      paragraph: inheritancePlanning.documentMultiKeyP1,
    },
    {
      title: inheritancePlanning.educateHireTitle,
      icon: <EducateHierIcon />,
      paragraph2: inheritancePlanning.educateHireP2,
      paragraph: inheritancePlanning.educateHireP1,
    },
    {
      title: inheritancePlanning.selectKnowledgeableTitle,
      icon: <SelectKnowledgeIcon />,
      paragraph2: inheritancePlanning.selectKnowledgeableP2,
      paragraph: inheritancePlanning.selectKnowledgeableP1,
    },
    {
      title: inheritancePlanning.regularUpdatesTitle,
      icon: <RegularUpdateIcon />,
      paragraph2: inheritancePlanning.regularUpdatesP2,
      paragraph: inheritancePlanning.regularUpdatesP1,
    },
  ];

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <InheritanceHeader />
      <Text style={styles.marginLeft} color={`${colorMode}.headerWhite`}>
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
