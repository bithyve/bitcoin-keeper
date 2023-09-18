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
      <HeaderTitle />
      <Box style={styles.versionHistoryTitleWrapper} testID="view_VersionHistory">
        <Text color="light.headerText" style={styles.versionHistoryTitle}>
          Version History
        </Text>
      </Box>
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
  versionHistoryTitleWrapper: {
    marginHorizontal: wp('10%'),
    marginBottom: 5,
  },
  versionHistoryTitle: {
    letterSpacing: 1,
    fontSize: 16,
    paddingLeft: 7,
  },
  textAppId: {
    textAlign: 'center',
    fontSize: 10,
    color: 'gray',
  },
});
export default AppVersionHistory;
