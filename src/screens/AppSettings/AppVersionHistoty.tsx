import React from 'react';
import { Box, Text, ScrollView, StatusBar } from 'native-base';
import { SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';

import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

import BackIcon from 'src/assets/icons/back.svg';
import VersionHistoryList from 'src/components/SettingComponent/VersionHistoryList';

function AppVersionHistory({ navigation }) {
  return (
    <SafeAreaView style={styles.wrapper}>
      <StatusBar backgroundColor="#F7F2EC" barStyle="dark-content" />
      <Box style={styles.backBtnWrapper}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackIcon />
        </TouchableOpacity>
      </Box>

      <Box style={styles.versionHistoryTitleWrapper}>
        <Text color="light.headerText" fontFamily="heading" style={styles.versionHistoryTitle}>
          Version History
        </Text>
      </Box>
      <ScrollView>
        <Box m={10}>
          <VersionHistoryList />
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F7F2EC',
  },
  backBtnWrapper: {
    marginTop: wp('18%'),
    marginBottom: wp('12%'),
    marginHorizontal: wp('8%'),
  },
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
