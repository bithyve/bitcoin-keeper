import React, { useContext } from 'react';
import Text from 'src/components/KeeperText';
import { Box, ScrollView, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import VersionHistoryList from 'src/components/SettingComponent/VersionHistoryList';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperHeader from 'src/components/KeeperHeader';
import { RealmSchema } from 'src/storage/realm/enum';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import dbManager from 'src/storage/realm/dbManager';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function AppVersionHistory() {
  const { colorMode } = useColorMode();
  const { publicId }: KeeperApp = dbManager.getObjectByIndex(RealmSchema.KeeperApp);
  const { translations } = useContext(LocalizationContext);
  const { settings } = translations;

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={settings.versionHistoryTitle}
        subtitle={settings.versionHistorySubTitle}
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Box margin={10} testID="view_VersionHistoryList">
          <VersionHistoryList />
        </Box>
      </ScrollView>
      <Text testID="text_appid" selectable style={styles.textAppId}>{`App ID: ${publicId}`}</Text>
    </ScreenWrapper>
  );
}
const styles = StyleSheet.create({
  textAppId: {
    textAlign: 'center',
    fontSize: 10,
    color: 'gray',
  },
});
export default AppVersionHistory;
