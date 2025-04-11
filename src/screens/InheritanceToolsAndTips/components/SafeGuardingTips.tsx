import React, { useContext } from 'react';
import { useColorMode } from 'native-base';
import ScreenWrapper from 'src/components/ScreenWrapper';
import TipsSlider from '../TipsSlider';
import InheritanceHeader from '../InheritanceHeader';
import ThoroughVerification from 'src/assets/images/thorough-verification.svg';
import PreliminaryTest from 'src/assets/images/preliminary-test.svg';
import SecureCoordination from 'src/assets/images/secure-coordination.svg';
import CrossDeviceVerification from 'src/assets/images/cross-device-verification.svg';

import Text from 'src/components/KeeperText';
import { wp } from 'src/constants/responsive';
import { StyleSheet } from 'react-native';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function SafeGuardingTips({}) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning } = translations;
  const tips = [
    {
      title: inheritancePlanning.thoroughVeirifcationTitle,
      icon: <ThoroughVerification />,
      paragraph: inheritancePlanning.thoroughParagraph1,
      paragraph2: inheritancePlanning.thoroughParagraph2,
    },

    {
      title: inheritancePlanning.preliminaryTitle,
      icon: <PreliminaryTest />,
      paragraph: inheritancePlanning.preliminaryParagraph1,
      paragraph2: inheritancePlanning.preliminaryParagraph2,
    },
    {
      title: inheritancePlanning.secureCoordinationTitle,
      icon: <SecureCoordination />,
      paragraph: inheritancePlanning.secureCoordinationParagraph1,
      paragraph2: inheritancePlanning.secureCoordinationParagraph2,
    },
    {
      title: inheritancePlanning.crossDeviceTitle,
      icon: <CrossDeviceVerification />,
      paragraph: inheritancePlanning.crossDeviceParagraph1,
      paragraph2: inheritancePlanning.crossDeviceParagraph2,
    },
  ];

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <InheritanceHeader />
      <Text style={styles.container} color={`${colorMode}.headerWhite`}>
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
