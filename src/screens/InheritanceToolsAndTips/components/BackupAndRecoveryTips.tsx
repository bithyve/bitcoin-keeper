import React, { useContext } from 'react';
import { useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { wp } from 'src/constants/responsive';
import TipsSlider from '../TipsSlider';
import InheritanceHeader from '../InheritanceHeader';
import Text from 'src/components/KeeperText';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { useSelector } from 'react-redux';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';

function BackupAndRecoveryTips({}) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning } = translations;
  const themeMode = useSelector((state: any) => state?.settings?.themeMode);
  const privateTheme = themeMode === 'PRIVATE';
  const PrivateThemeLight = themeMode === 'PRIVATE_LIGHT';

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
    <ScreenWrapper
      barStyle="dark-content"
      backgroundcolor={
        privateTheme || PrivateThemeLight
          ? `${colorMode}.primaryBackground`
          : `${colorMode}.pantoneGreen`
      }
    >
      <InheritanceHeader />
      <Text
        style={styles.marginLeft}
        color={PrivateThemeLight ? `${colorMode}.textBlack` : `${colorMode}.headerWhite`}
      >
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
