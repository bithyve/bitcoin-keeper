import React, { useContext } from 'react';
import { useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { wp } from 'src/constants/responsive';
import TipsSlider from '../TipsSlider';
import InheritanceHeader from '../InheritanceHeader';
import ComprehensiveStrategies from 'src/assets/images/comprehensive_tips.svg';
import RegularTesting from 'src/assets/images/regular-testing.svg';
import PracticeRecovery from 'src/assets/images/practice-recovery.svg';
import KeepBackups from 'src/assets/images/keep-backups.svg';

import Text from 'src/components/KeeperText';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import usePlan from 'src/hooks/usePlan';
import PrivateComprehensiveStrategies from 'src/assets/images/private-doc-comprehensive.svg';
import PrivateRegularTesting from 'src/assets/images/private-doc-4-keys.svg';
import PrivateKeepBackups from 'src/assets/images/private-doc-recovery.svg';
import PrivateRecovery from 'src/assets/images/private-doc-Double.svg';

function BackupAndRecoveryTips({}) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning } = translations;
  const { isOnL4 } = usePlan();

  const tips = [
    {
      title: inheritancePlanning.backupRecoveryComprehensive,
      icon: isOnL4 ? <PrivateComprehensiveStrategies /> : <ComprehensiveStrategies />,
      paragraph2: inheritancePlanning.backupRecoveryComprehensiveP2,
      paragraph: inheritancePlanning.backupRecoveryComprehensiveP1,
    },
    {
      title: inheritancePlanning.backupRecoveryConduct,
      icon: isOnL4 ? <PrivateRegularTesting /> : <RegularTesting />,
      paragraph2: inheritancePlanning.backupRecoveryConductP2,
      paragraph: inheritancePlanning.backupRecoveryConductP1,
    },
    {
      title: inheritancePlanning.backupRecovertPractice,

      icon: isOnL4 ? <PrivateRecovery /> : <PracticeRecovery />,
      paragraph2: inheritancePlanning.backupRecoveryP2,
      paragraph: inheritancePlanning.backupRecoveryP1,
    },
    {
      title: inheritancePlanning.backupKeepsBackup,
      icon: isOnL4 ? <PrivateKeepBackups /> : <KeepBackups />,
      paragraph2: inheritancePlanning.backupKeepsBackupP2,
      paragraph: inheritancePlanning.backupKeepsBackupP1,
    },
  ];

  return (
    <ScreenWrapper
      barStyle="dark-content"
      backgroundcolor={isOnL4 ? `${colorMode}.primaryBackground` : `${colorMode}.pantoneGreen`}
    >
      <InheritanceHeader />
      <Text style={styles.marginLeft} color={`${colorMode}.headerWhite`}>
        {inheritancePlanning.backupRecoveryTips}
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

export default BackupAndRecoveryTips;
