import React from 'react';
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

function BackupAndRecoveryTips({}) {
  const { colorMode } = useColorMode();

  const tips = [
    {
      title: 'Implement Comprehensive Backup Strategies',
      icon: <ComprehensiveStrategies />,
      paragraph2:
        'These backups should be stored in secure, discrete locations to ensure redundancy and resilience against loss or environmental damage.',
      paragraph:
        'Create durable backups of all critical components, like seed phrases and multi-key configurations, on both physical (metal tools for engraving) and digital (encrypted files) mediums.',
    },
    {
      title: 'Conduct Regular Backup Testing',
      icon: <RegularTesting />,
      paragraph2:
        'Try all the methods for backup and recovery suggested by Keeper and see what suits you. Ensure you can perform this step during an emergency.',
      paragraph:
        'As a test, use the backup information to recover your multi-key setup periodically. The test ensures your backup’s reliability for restoring access to your bitcoin.',
    },
    {
      title: 'Practice Recovery by Deletion and Restoration',

      icon: <PracticeRecovery />,
      paragraph2:
        'This process tests the effectiveness of your backup strategy, ensuring that you can confidently rely on it for recovering access to your bitcoin.',
      paragraph:
        'After backing up your app and multi-key configuration, intentionally delete the setup from your primary device. Then, attempt to recover it on a fresh app installation or another coordinator app using your backup.',
    },
    {
      title: 'Keep Backups and Documentation Updated',
      icon: <KeepBackups />,
      paragraph2:
        'Maintaining up-to-date backups is essential for seamless access to your bitcoin, providing security and peace of mind.',
      paragraph:
        'Whenever changes are made to your multi-key setup, promptly update your backups and any associated documentation to reflect these adjustments. This includes revising recovery instructions and ensuring all backup mediums are current.',
    },
  ];

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <InheritanceHeader />
      <Text style={styles.marginLeft} color={`${colorMode}.white`}>
        Backup and Recovery Tips
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
