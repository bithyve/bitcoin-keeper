import { Box, useColorMode } from 'native-base';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import SettingCard from './Component/SettingCard';
import { useSettingKeeper } from 'src/hooks/useSettingKeeper';
import { LocalizationContext } from 'src/context/Localization/LocContext';

export const AppTipsScreen = () => {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const { Tips } = useSettingKeeper();

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <Box style={styles.container} backgroundColor={`${colorMode}.primaryBackground`}>
        <Box style={styles.header}>
          <WalletHeader title={common.tips} />
        </Box>
        <SettingCard
          subtitleColor={`${colorMode}.balanceText`}
          backgroundColor={`${colorMode}.textInputBackground`}
          borderColor={`${colorMode}.separator`}
          items={Tips}
        />
      </Box>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    marginBottom: 18,
  },
});
