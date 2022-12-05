import React from 'react';
import { Box, Text, ScrollView, StatusBar } from 'native-base';
import { SafeAreaView, TouchableOpacity } from 'react-native';

import BackIcon from 'src/assets/icons/back.svg';
import { RFValue } from 'react-native-responsive-fontsize';
import VersionHistoryList from 'src/components/SettingComponent/VersionHistoryList';

function AppVersionHistory({ navigation }) {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#F7F2EC',
      }}
    >
      <StatusBar backgroundColor="#F7F2EC" barStyle="dark-content" />
      <Box mx={10} my={10}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackIcon />
        </TouchableOpacity>
      </Box>

      <Box mx={10} mb={5}>
        <Text
          color="light.headerText"
          fontWeight={200}
          letterSpacing={1}
          fontSize={RFValue(16)}
          fontFamily="heading"
          pl={10}
        >
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
export default AppVersionHistory;
