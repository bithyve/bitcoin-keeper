import React, { useContext } from 'react';
import { useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { wp } from 'src/constants/responsive';
import TipsSlider from '../TipsSlider';
import InheritanceHeader from '../InheritanceHeader';
import Text from 'src/components/KeeperText';
import MultiSig from 'src/assets/images/multsig-tip.svg';
import DiversifyHardware from 'src/assets/images/diversify-hardware.svg';
import BackupAcidFree from 'src/assets/images/backup-acidfree.svg';
import VariedSecuredLocation from 'src/assets/images/varied-secured-location.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function SafeGuardingTips({}) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning } = translations;

  const tips = [
    {
      title: inheritancePlanning.activeMultiKeySecurity,
      icon: <MultiSig />,
      paragraph: inheritancePlanning.activeMultiKeySecurityDesc1,

      paragraph2: inheritancePlanning.activeMultiKeySecurityDesc2,
    },
    {
      title: inheritancePlanning.diversifyHardware,
      icon: <DiversifyHardware />,
      paragraph2: inheritancePlanning.diversifyHardwareDesc1,

      paragraph: inheritancePlanning.diversifyHardwareDesc2,
    },
    {
      title: inheritancePlanning.backupsOnAcidFreePaperAndMetal,
      icon: <BackupAcidFree />,
      paragraph2: inheritancePlanning.backupsOnAcidFreePaperAndMetalDesc1,
      paragraph: inheritancePlanning.backupsOnAcidFreePaperAndMetalDesc2,
    },
    {
      title: inheritancePlanning.variedAndSecureStorageLocations,
      icon: <VariedSecuredLocation />,
      paragraph2: inheritancePlanning.variedAndSecureStorageLocationsDesc1,
      paragraph: inheritancePlanning.variedAndSecureStorageLocationsDesc2,
    },
  ];

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <InheritanceHeader />
      <Text style={styles.container} color={`${colorMode}.headerWhite`}>
        {inheritancePlanning.keySafekeeping}
      </Text>
      <TipsSlider items={tips} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: wp(10),
  },
});

export default SafeGuardingTips;
