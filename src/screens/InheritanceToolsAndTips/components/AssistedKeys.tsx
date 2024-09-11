import React, { useContext } from 'react';
import { useColorMode } from 'native-base';
import ScreenWrapper from 'src/components/ScreenWrapper';
import InheritanceHeader from '../InheritanceHeader';
import SigningServer from 'src/assets/images/ss-green.svg';
import InheritanceKey from 'src/assets/images/iks-green.svg';

import AssistedKeysIcon from 'src/assets/images/assisted-key.svg';
import InheritanceKeyIcon from 'src/assets/images/inheritance-key.svg';
import AssistedKeysSlider from '../AssistedKeysSlider';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function InheritanceTips({}) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning } = translations;
  const tips = [
    {
      title: inheritancePlanning.signingServerHeading,
      description: inheritancePlanning.signingServerDescp,
      icon: <AssistedKeysIcon />,
      paragraph2: inheritancePlanning.signingServerParagraph2,
      paragraph: inheritancePlanning.signingServerParagraph1,
      callback: () => navigation.dispatch(CommonActions.navigate({ name: 'ManageSigners' })),
      buttonIcon: <SigningServer />,
      buttonTitle: inheritancePlanning.signingServerCtaTitle,
      buttonDescription: inheritancePlanning.signingServerCtaDescp,
      note: inheritancePlanning.signingServerNotes,
    },
    {
      title: inheritancePlanning.inheritanceKey,
      description: inheritancePlanning.inheritanceKeyDescp,
      icon: <InheritanceKeyIcon />,
      paragraph2: inheritancePlanning.inheritanceKeyParagraph2,
      paragraph: inheritancePlanning.inheritanceKeyParagraph1,
      callback: () => navigation.dispatch(CommonActions.navigate({ name: 'ManageSigners' })),

      buttonIcon: <InheritanceKey />,
      buttonTitle: inheritancePlanning.inheritanceKeyCtaTitle,
      buttonDescription: inheritancePlanning.inheritanceKeyCtaDescp,
      note: inheritancePlanning.inheritanceKeyCtaNotes,
    },
  ];

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.modalGreenBackground`}>
      <InheritanceHeader slider={true} />
      <AssistedKeysSlider items={tips} />
    </ScreenWrapper>
  );
}

export default InheritanceTips;
