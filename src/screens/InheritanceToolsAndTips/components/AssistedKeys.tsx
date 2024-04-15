import React, { useContext } from 'react';
import { Box, useColorMode } from 'native-base';
import ScreenWrapper from 'src/components/ScreenWrapper';
import InheritanceHeader from '../InheritanceHeader';
import Chip from 'src/assets/images/chip.svg';
import Add from 'src/assets/images/add-green.svg';

import AssistedKeysIcon from 'src/assets/images/assisted-key.svg';
import AssistedKeysSlider from '../AssistedKeysSlider';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function InheritanceTips({}) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning } = translations;
  const tips = [
    {
      title: inheritancePlanning.signingServerHeading,
      description: inheritancePlanning.signingServerHeading,
      icon: <AssistedKeysIcon />,
      paragraph2: inheritancePlanning.signingServerParagraph2,
      paragraph: inheritancePlanning.signingServerParagraph1,
      callback: () => navigation.dispatch(CommonActions.navigate({ name: 'ManageSigners' })),
      buttonIcon: <Chip />,
      buttonTitle: inheritancePlanning.signingServerCtaTitle,
      buttonDescription: inheritancePlanning.signingServerCtaDescp,
      note: inheritancePlanning.signingServerNotes,
    },
    {
      title: inheritancePlanning.inheritanceKey,
      description: inheritancePlanning.inheritanceKeyDescp,
      icon: <AssistedKeysIcon />,
      paragraph2: inheritancePlanning.inheritanceKeyParagraph2,
      paragraph: inheritancePlanning.inheritanceKeyParagraph1,
      callback: () => navigation.dispatch(CommonActions.navigate({ name: 'ManageSigners' })),

      buttonIcon: <Add />,
      buttonTitle: inheritancePlanning.inheritanceKeyCtaTitle,
      buttonDescription: inheritancePlanning.inheritanceKeyCtaDescp,
      note: inheritancePlanning.inheritanceKeyCtaNotes,
    },
  ];

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <InheritanceHeader slider={true} />
      <AssistedKeysSlider items={tips} />
    </ScreenWrapper>
  );
}

export default InheritanceTips;
