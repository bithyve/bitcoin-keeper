import React, { useContext } from 'react';
import Text from 'src/components/KeeperText';
import { ScrollView, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import VersionHistoryList from 'src/components/SettingComponent/VersionHistoryList';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperHeader from 'src/components/KeeperHeader';
import { RealmSchema } from 'src/storage/realm/enum';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import dbManager from 'src/storage/realm/dbManager';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { hp, wp } from 'src/constants/responsive';
import WalletHeader from 'src/components/WalletHeader';

function AppVersionHistory() {
  const { colorMode } = useColorMode();
  const { publicId }: KeeperApp = dbManager.getObjectByIndex(RealmSchema.KeeperApp);
  const { translations } = useContext(LocalizationContext);
  const { settings } = translations;

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader
        title={settings.versionHistoryTitle}
        subTitle={settings.versionHistorySubTitle}
      />
      <ScrollView style={styles.versionHistory} testID="view_VersionHistoryList">
        <VersionHistoryList />
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
  versionHistory: {
    marginHorizontal: wp(13),
    marginTop: hp(25),
    marginBottom: hp(5),
  },
});
export default AppVersionHistory;
