import React from 'react';
import { Box, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { wp } from 'src/constants/responsive';
import TipsSlider from '../TipsSlider';
import InheritanceHeader from '../InheritanceHeader';
import CanaryIcon from 'src/assets/images/canary-wallets.svg';
import MultiKeySetupIcon from 'src/assets/images/document_multi_key_setup.svg';
import EducateHierIcon from 'src/assets/images/educate_hier.svg';
import SelectKnowledgeIcon from 'src/assets/images/select_knowledge.svg';
import RegularUpdateIcon from 'src/assets/images/regular_update_icon.svg';

import Text from 'src/components/KeeperText';
import Breadcrumbs from 'src/components/Breadcrumbs';

function InheritanceTips({}) {
  const { colorMode } = useColorMode();

  const tips = [
    {
      title: 'Document Multi-Key Setup for Heirs',
      icon: <MultiKeySetupIcon />,
      paragraph2:
        'Please make sure that your heir has access to the wallet configuration file and knows how to recover a vault using it.',
      paragraph:
        'Clearly outline your multi-key setup in estate planning documents, specifying who inherits your bitcoin. This ensures heirs have both legal rights and practical guidance for accessing their inheritance, bridging any knowledge gaps.',
    },
    {
      title: 'Educate Heirs on Bitcoin and Multi-Key Security',
      icon: <EducateHierIcon />,
      paragraph2:
        'Ask your heir to test the multi-key setups they create. This would act as good practice for them to inherit your bitcoin.',
      paragraph:
        'Proactively teach heirs about the importance of bitcoin security, focusing on multi-key practices. Well-informed heirs are better equipped to manage and secure their bitcoin effectively.',
    },
    {
      title: 'Select Knowledgeable Executors or Trustees',
      icon: <SelectKnowledgeIcon />,
      paragraph2:
        'Please ensure that the trustees are, trustable. Else you run the risk of them colluding to keep your bitcoin for themselves.',
      paragraph:
        'Choose executors or trustees with a thorough understanding of bitcoin and multi-key systems. Their expertise will be crucial in managing and transferring your bitcoin according to your wishes, ensuring a smooth inheritance process.',
    },
    {
      title: 'Regularly Update Estate Plans and Instructions',
      icon: <RegularUpdateIcon />,
      paragraph2:
        'Please keep an eye out for firmware and other updates from device manufacturers. Sometimes buttons get moved around or processes change that would need to be updated in your instructions.',
      paragraph:
        'Keep your estate planning documents and instructions regarding your multi-key setup, up-to-date. Changes in your setup or personal circumstances should be promptly reflected to avoid future complications for your heirs.',
    },
  ];

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <InheritanceHeader />
      <Text style={styles.marginLeft} color={`${colorMode}.white`}>
        Inheritance Tips
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
