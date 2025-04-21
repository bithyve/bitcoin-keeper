import React, { useContext } from 'react';
import { useColorMode } from 'native-base';
import ScreenWrapper from 'src/components/ScreenWrapper';
import TipsSlider from '../TipsSlider';
import InheritanceHeader from '../InheritanceHeader';
import ThoroughVerification from 'src/assets/images/thorough-verification.svg';
import PreliminaryTest from 'src/assets/images/preliminary-test.svg';
import SecureCoordination from 'src/assets/images/secure-coordination.svg';
import CrossDeviceVerification from 'src/assets/images/cross-device-verification.svg';
import PrivateThoroughVerification from 'src/assets/images/private-doc-seed-word.svg';
import PrivatePreliminaryTest from 'src/assets/images/private-doc-Double.svg';
import PrivateSecureCoordination from 'src/assets/images/private-doc-tirple-person.svg';
import PrivateCrossDeviceVerification from 'src/assets/images/private-doc-4-keys.svg';

import Text from 'src/components/KeeperText';
import { wp } from 'src/constants/responsive';
import { StyleSheet } from 'react-native';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import usePlan from 'src/hooks/usePlan';

function SafeGuardingTips({}) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning } = translations;
  const { isOnL4 } = usePlan();
  const tips = [
    {
      title: inheritancePlanning.thoroughVeirifcationTitle,
      icon: isOnL4 ? <PrivateThoroughVerification /> : <ThoroughVerification />,
      paragraph: inheritancePlanning.thoroughParagraph1,
      paragraph2: inheritancePlanning.thoroughParagraph2,
    },

    {
      title: inheritancePlanning.preliminaryTitle,
      icon: isOnL4 ? <PrivatePreliminaryTest /> : <PreliminaryTest />,
      paragraph: inheritancePlanning.preliminaryParagraph1,
      paragraph2: inheritancePlanning.preliminaryParagraph2,
    },
    {
      title: inheritancePlanning.secureCoordinationTitle,
      icon: isOnL4 ? <PrivateSecureCoordination /> : <SecureCoordination />,
      paragraph: inheritancePlanning.secureCoordinationParagraph1,
      paragraph2: inheritancePlanning.secureCoordinationParagraph2,
    },
    {
      title: inheritancePlanning.crossDeviceTitle,
      icon: isOnL4 ? <PrivateCrossDeviceVerification /> : <CrossDeviceVerification />,
      paragraph: inheritancePlanning.crossDeviceParagraph1,
      paragraph2: inheritancePlanning.crossDeviceParagraph2,
    },
  ];

  return (
    <ScreenWrapper
      barStyle="dark-content"
      backgroundcolor={isOnL4 ? `${colorMode}.primaryBackground` : `${colorMode}.pantoneGreen`}
    >
      <InheritanceHeader />
      <Text style={styles.container} color={`${colorMode}.headerWhite`}>
        Tips for Doing Transactions Securely
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
