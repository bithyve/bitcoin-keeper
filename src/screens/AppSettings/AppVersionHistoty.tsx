import React, { useContext } from 'react';
import Text from 'src/components/KeeperText';
import { Box, ScrollView, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';

import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

import VersionHistoryList from 'src/components/SettingComponent/VersionHistoryList';
import ScreenWrapper from 'src/components/ScreenWrapper';
import HeaderTitle from 'src/components/HeaderTitle';
import { RealmSchema } from 'src/storage/realm/enum';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import dbManager from 'src/storage/realm/dbManager';

function AppVersionHistory() {
  const { colorMode } = useColorMode();
  const { publicId }: KeeperApp = dbManager.getObjectByIndex(RealmSchema.KeeperApp);

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <HeaderTitle
        title={'Version History'}
        subtitle={'You can verify the history of your app upgrades here'}
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Box margin={10} testID="view_VersionHistoryList">
          <VersionHistoryList />
        </Box>
      </ScrollView>
      <Text selectable style={styles.textAppId}>{`App ID: ${publicId}`}</Text>
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
