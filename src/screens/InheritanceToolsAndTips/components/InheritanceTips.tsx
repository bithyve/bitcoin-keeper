import React from 'react';
import { useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { wp } from 'src/constants/responsive';
import TipsSlider from '../TipsSlider';
import InheritanceHeader from '../InheritanceHeader';
import CanaryIcon from 'src/assets/images/canary-wallets.svg';
import Text from 'src/components/KeeperText';

function InheritanceTips({}) {
  const { colorMode } = useColorMode();

  const tips = [
    {
      title: 'Document Multi-Key Setup for Heirs',
      icon: <CanaryIcon />,
      paragraph2:
        'Please make sure that your heir has access to the wallet configuration file and knows how to recover a vault using it',
      paragraph:
        'Clearly outline your multi-key setup in estate planning documents, specifying who inherits your bitcoin. This ensures heirs have both legal rights and practical guidance for accessing their inheritance, bridging any knowledge gaps.',
    },
    {
      title: 'Educate Heirs on Bitcoin and Multi-Key Security',
      icon: <CanaryIcon />,
      paragraph2:
        'Ask your heir to test the multi-key setups they create. This would act as good practice for them to inherit your bitcoin',
      paragraph:
        'Proactively teach heirs about the importance of bitcoin security, focusing on multi-key practices. Well-informed heirs are better equipped to manage and secure their future digital assets effectively.',
    },
    {
      title: 'Select Knowledgeable Executors or Trustees',
      icon: <CanaryIcon />,
      paragraph2:
        'Please ensure that the trustees are, trustable. Else you run the risk of them colluding to keep your bitcoin for themselves',
      paragraph:
        'Choose executors or trustees with a thorough understanding of bitcoin and multi-key systems. Their expertise will be crucial in managing and transferring your bitcoin according to your wishes, ensuring a smooth inheritance process.',
    },
    {
      title: 'Regularly Update Estate Plans and Instructions',
      icon: <CanaryIcon />,
      paragraph2:
        'Please keep an eye out for firmware and other updates from device manufacturers. Sometimes buttons get moved around or processes change that would need to be updated in your instructions',
      paragraph:
        'Keep your estate planning documents and instructions regarding your multi-key setup, up-to-date. Changes in your setup or personal circumstances should be promptly reflected to avoid future complications for your heirs.',
    },
  ];

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <InheritanceHeader />
      <Text color={`${colorMode}.white`}>Inheritance Tips</Text>
      <TipsSlider items={tips} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    marginLeft: wp(20),
  },
});

export default InheritanceTips;
