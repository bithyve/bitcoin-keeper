import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { wp } from 'src/constants/responsive';
import TipsSlider from '../TipsSlider';
import InheritanceHeader from '../InheritanceHeader';
import Text from 'src/components/KeeperText';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';
import ThemedColor from 'src/components/ThemedColor/ThemedColor';

function BackupAndRecoveryTips({}) {
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning } = translations;
  const slider_background = ThemedColor({ name: 'slider_background' });
  const green_modal_text_color = ThemedColor({ name: 'green_modal_text_color' });

  const tips = [
    {
      title: inheritancePlanning.backupRecoveryComprehensive,
      icon: <ThemedSvg name={'multiKeySetupIcon_illustration'} />,
      paragraph2: inheritancePlanning.backupRecoveryComprehensiveP2,
      paragraph: inheritancePlanning.backupRecoveryComprehensiveP1,
    },
    {
      title: inheritancePlanning.backupRecoveryConduct,
      icon: <ThemedSvg name={'backup_illustration'} />,
      paragraph2: inheritancePlanning.backupRecoveryConductP2,
      paragraph: inheritancePlanning.backupRecoveryConductP1,
    },
    {
      title: inheritancePlanning.backupRecovertPractice,

      icon: <ThemedSvg name={'restore_illustration'} />,
      paragraph2: inheritancePlanning.backupRecoveryP2,
      paragraph: inheritancePlanning.backupRecoveryP1,
    },
    {
      title: inheritancePlanning.backupKeepsBackup,
      icon: <ThemedSvg name={'estatePlan_illustration'} />,
      paragraph2: inheritancePlanning.backupKeepsBackupP2,
      paragraph: inheritancePlanning.backupKeepsBackupP1,
    },
  ];

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={slider_background}>
      <InheritanceHeader />
      <Text style={styles.marginLeft} color={green_modal_text_color}>
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
