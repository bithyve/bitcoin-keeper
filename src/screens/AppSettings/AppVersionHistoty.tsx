import React from 'react';
import Text from 'src/components/KeeperText';
import { Box, ScrollView } from 'native-base';
import { StyleSheet } from 'react-native';

import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

import VersionHistoryList from 'src/components/SettingComponent/VersionHistoryList';
import ScreenWrapper from 'src/components/ScreenWrapper';
import HeaderTitle from 'src/components/HeaderTitle';

function AppVersionHistory() {
  return (
    <ScreenWrapper>
      <HeaderTitle />
      <Box style={styles.versionHistoryTitleWrapper}>
        <Text color="light.headerText" style={styles.versionHistoryTitle}>
          Version History
        </Text>
      </Box>
      <ScrollView>
        <Box margin={10}>
          <VersionHistoryList />
        </Box>
      </ScrollView>
    </ScreenWrapper>
  );
}
const styles = StyleSheet.create({
  versionHistoryTitleWrapper: {
    marginHorizontal: wp('10%'),
    marginBottom: 5,
  },
  versionHistoryTitle: {
    fontWeight: '300',
    letterSpacing: 1,
    fontSize: 16,
    paddingLeft: 7,
  },
});
export default AppVersionHistory;
