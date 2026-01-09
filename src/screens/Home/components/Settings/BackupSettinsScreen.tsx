import { Box, useColorMode } from 'native-base';
import React, { useContext, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import SettingCard from './Component/SettingCard';
import { useSettingKeeper } from 'src/hooks/useSettingKeeper';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import { useAppSelector } from 'src/store/hooks';
import SettingModal from './Component/SettingModal';

export const BackupSettingsScreen = ({ navigation, route }) => {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning } = translations;
  const { BackAndRecovery, DeleteBackupModal, confirmPass, setConfirmPass } = useSettingKeeper();
  const { backupAllLoading } = useAppSelector((state) => state.bhr);

  const isUaiFlow: boolean = route.params?.isUaiFlow ?? false;

  useEffect(() => {
    return () => {
      if (isUaiFlow) {
        navigation.setParams({ isUaiFlow: false });
      }
    };
  }, []);

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <Box style={styles.container} backgroundColor={`${colorMode}.primaryBackground`}>
        <Box style={styles.header}>
          <WalletHeader title={inheritancePlanning.backupRecovery} />
        </Box>
        <SettingCard
          subtitleColor={`${colorMode}.balanceText`}
          backgroundColor={`${colorMode}.textInputBackground`}
          borderColor={`${colorMode}.separator`}
          items={BackAndRecovery}
        />
      </Box>
      <SettingModal
        isUaiFlow={isUaiFlow}
        confirmPass={confirmPass}
        setConfirmPass={setConfirmPass}
      />
      {DeleteBackupModal}
      <ActivityIndicatorView visible={backupAllLoading} showLoader />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    marginBottom: 18,
  },
});
