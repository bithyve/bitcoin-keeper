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

function BackupAndRecoveryTips({}) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning } = translations;

  const tips = [
    {
      title: inheritancePlanning.backupRecoveryComprehensive,
      icon: <ComprehensiveStrategies />,
      paragraph2: inheritancePlanning.backupRecoveryComprehensiveP2,
      paragraph: inheritancePlanning.backupRecoveryComprehensiveP1,
    },
    {
      title: inheritancePlanning.backupRecoveryConduct,
      icon: <RegularTesting />,
      paragraph2: inheritancePlanning.backupRecoveryConductP2,
      paragraph: inheritancePlanning.backupRecoveryConductP1,
    },
    {
      title: inheritancePlanning.backupRecovertPractice,

      icon: <PracticeRecovery />,
      paragraph2: inheritancePlanning.backupRecoveryP2,
      paragraph: inheritancePlanning.backupRecoveryP1,
    },
    {
      title: inheritancePlanning.backupKeepsBackup,
      icon: <KeepBackups />,
      paragraph2: inheritancePlanning.backupKeepsBackupP2,
      paragraph: inheritancePlanning.backupKeepsBackupP1,
    },
  ];

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
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
