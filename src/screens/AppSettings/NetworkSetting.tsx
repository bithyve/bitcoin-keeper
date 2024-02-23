import React, { useContext } from 'react';
import { Box, useColorMode } from 'native-base';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperHeader from 'src/components/KeeperHeader';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import OptionCard from 'src/components/OptionCard';
import { StyleSheet } from 'react-native';
import { hp } from 'src/constants/responsive';

function NetworkSetting({ navigation }) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { settings } = translations;
  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader title={settings.networkSettings} subtitle={settings.networkSettingSubTitle} />
      <Box style={styles.wrapper}>
        <OptionCard
          title={settings.torSettingTitle}
          description={settings.torSettingSubTitle}
          callback={() => navigation.navigate('TorSettings')}
        />
        <OptionCard
          title={settings.nodeSettings}
          description={settings.nodeSettingsSubtitle}
          callback={() => navigation.navigate('NodeSettings')}
        />
      </Box>
    </ScreenWrapper>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    marginTop: hp(35),
  },
});
export default NetworkSetting;
