import React from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/constants/responsive';
import Colors from 'src/theme/Colors';

function BackupAndRecoveryTips({}) {
  const { colorMode } = useColorMode();

  const tips = [
    {
      title: 'Implement Comprehensive Backup Strategies',
      content:
        'Create durable backups of all critical components, like seed phrases and multi-key configurations, on both physical (metal tools for engraving) and digital (encrypted files) mediums. These backups should be stored in secure, discrete locations to ensure redundancy and resilience against loss or environmental damage.',
    },
    {
      title: 'Conduct Regular Backup Testing',
      content:
        'It’s crucial to periodically test your backups in a secure setting to confirm their reliability for restoring access to your bitcoin. This involves using the backup information to recover your multi-key setup, ensuring that you can access your bitcoin in emergencies without any obstacles.',
    },
    {
      title: 'Practice Recovery by Deletion and Restoration',
      content:
        'After backing up your app and multi-key configuration, intentionally delete the setup from your primary device. Then, attempt to recover it on a fresh app installation or another coordinator app using your backup. This process tests the effectiveness of your backup strategy, ensuring that you can confidently rely on it for recovering access to your bitcoin.',
    },
    {
      title: 'Keep Backups and Documentation Updated',
      content:
        'Whenever changes are made to your multi-key setup, promptly update your backups and any associated documentation to reflect these adjustments. This includes revising recovery instructions and ensuring all backup mediums are current. Maintaining up-to-date backups is essential for seamless access to your bitcoin, providing security and peace of mind.',
    },
  ];

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <KeeperHeader />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>{`Backup and Recovery Tips`}</Text>
        {tips.map((tip, index) => (
          <Box key={index}>
            <Text bold color={`${colorMode}.white`} style={styles.titleStyle}>{`${index + 1}. ${
              tip.title
            }`}</Text>
            <Text color={`${colorMode}.white`}>{tip.content}</Text>
          </Box>
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    marginLeft: wp(20),
  },
  heading: {
    fontSize: 18,
    color: Colors.White,
    marginBottom: hp(28),
  },
  titleStyle: {
    fontSize: 14,
    marginVertical: hp(12),
  },
});

export default BackupAndRecoveryTips;
