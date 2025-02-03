import { Box, useColorMode } from 'native-base';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import SettingCard from './Component/SettingCard';
import { useSettingKeeper } from 'src/hooks/useSettingKeeper';

const SettingsApp = () => {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { settings } = translations;
  const { appSetting } = useSettingKeeper();

  return (
    <ScreenWrapper>
      <Box style={styles.container}>
        <Box style={styles.header}>
          <WalletHeader title={settings.appSetting} />
        </Box>

        <SettingCard
          subtitleColor={`${colorMode}.balanceText`}
          backgroundColor={`${colorMode}.textInputBackground`}
          borderColor={`${colorMode}.separator`}
          items={appSetting}
        />
      </Box>
    </ScreenWrapper>
  );
};

export default SettingsApp;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    marginBottom: 18,
  },
});
