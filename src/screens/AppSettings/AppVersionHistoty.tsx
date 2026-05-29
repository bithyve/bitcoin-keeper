import React, { useContext, useState } from 'react';
import Text from 'src/components/KeeperText';
import { ScrollView, useColorMode } from '@gluestack-ui/themed-native-base';
import { Pressable, StyleSheet } from 'react-native';
import VersionHistoryList from 'src/components/SettingComponent/VersionHistoryList';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { RealmSchema } from 'src/storage/realm/enum';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import dbManager from 'src/storage/realm/dbManager';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { hp, wp } from 'src/constants/responsive';
import WalletHeader from 'src/components/WalletHeader';

function AppVersionHistory({ navigation }: any) {
  const { colorMode } = useColorMode();
  const { publicId }: KeeperApp = dbManager.getObjectByIndex(RealmSchema.KeeperApp);
  const { translations } = useContext(LocalizationContext);
  const { settings } = translations;
  const [tapCount, setTapCount] = useState(0);

  const onAppIdPress = () => {
    const next = tapCount + 1;
    if (next < 7) {
      setTapCount(next);
      return;
    }
    setTapCount(0);
    navigation.navigate('RagChunkAdmin');
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader
        title={settings.versionHistoryTitle}
        subTitle={settings.versionHistorySubTitle}
      />
      <ScrollView style={styles.versionHistory} testID="view_VersionHistoryList">
        <VersionHistoryList />
      </ScrollView>
      <Pressable onPress={onAppIdPress}>
        <Text testID="text_appid" selectable style={styles.textAppId}>{`App ID: ${publicId}`}</Text>
      </Pressable>
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
