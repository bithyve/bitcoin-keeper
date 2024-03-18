import React from 'react';
import { useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { wp } from 'src/constants/responsive';
import TipsSlider from '../TipsSlider';
import InheritanceHeader from '../InheritanceHeader';
import CanaryIcon from 'src/assets/images/canary-wallets.svg';
import MultiSig from 'src/assets/images/multsig-tip.svg';

import Text from 'src/components/KeeperText';

function BackupAndRecoveryTips({}) {
  const { colorMode } = useColorMode();

  const tips = [
    {
      title: 'Implement Comprehensive Backup Strategies',
      icon: <MultiSig />,
      paragraph2:
        'These backups should be stored in secure, discrete locations to ensure redundancy and resilience against loss or environmental damage.',
      paragraph:
        'Create durable backups of all critical components, like seed phrases and multi-key configurations, on both physical (metal tools for engraving) and digital (encrypted files) mediums. These backups should be stored in secure, discrete locations to ensure redundancy and resilience against loss or environmental damage.',
    },
    {
      title: 'Conduct Regular Backup Testing',
      icon: <CanaryIcon />,
      paragraph2:
        'This involves using the backup information to recover your multi-key setup, ensuring that you can access your bitcoin in emergencies without any obstacles.',
      paragraph:
        'It’s crucial to periodically test your backups in a secure setting to confirm their reliability for restoring access to your bitcoin. This involves using the backup information to recover your multi-key setup, ensuring that you can access your bitcoin in emergencies without any obstacles.',
    },
    {
      title: 'Practice Recovery by Deletion and Restoration',

      icon: <CanaryIcon />,
      paragraph2:
        'This process tests the effectiveness of your backup strategy, ensuring that you can confidently rely on it for recovering access to your bitcoin.',
      paragraph:
        'After backing up your app and multi-key configuration, intentionally delete the setup from your primary device. Then, attempt to recover it on a fresh app installation or another coordinator app using your backup. This process tests the effectiveness of your backup strategy, ensuring that you can confidently rely on it for recovering access to your bitcoin.',
    },
    {
      title: 'Keep Backups and Documentation Updated',
      icon: <CanaryIcon />,
      paragraph2:
        'Maintaining up-to-date backups is essential for seamless access to your bitcoin, providing security and peace of mind.',
      paragraph:
        'Whenever changes are made to your multi-key setup, promptly update your backups and any associated documentation to reflect these adjustments. This includes revising recovery instructions and ensuring all backup mediums are current. Maintaining up-to-date backups is essential for seamless access to your bitcoin, providing security and peace of mind.',
    },
  ];

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <InheritanceHeader />
      <Text color={`${colorMode}.white`}>Backup and Recovery Tips</Text>
      <TipsSlider items={tips} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    marginLeft: wp(20),
  },
});

export default BackupAndRecoveryTips;
