import React, { useState, useEffect } from 'react';
import { FlatList, Box, Text, ScrollView, StatusBar, useColorMode, Pressable } from 'native-base';

import { RFValue } from 'react-native-responsive-fontsize';
const data = [
  {
    id: 1,
    versionTitle: 'Version 1.0.9',
    comment1: 'App Enhancements',
    comment2: 'Bug Fixes',
    comment3: 'New Integration - Swan Bitcoin',
  },
  {
    id: 2,
    versionTitle: 'Version 1.0.8',
    comment1: 'App Enhancements',
    comment2: 'Bug Fixes',
  },
  {
    id: 3,
    versionTitle: 'Version 1.0.7',
    comment1: 'App Enhancements',
    comment2: 'Bug Fixes',
  },
];
const VersionHistoryList = () => {
  return (
    <FlatList
      data={data}
      renderItem={({ item }) => (
        <Box bg={'light.lightYellow'} p={5} borderRadius={10} my={2}>
          <Text color={'light.headerText'} fontSize={RFValue(14)} fontFamily={'heading'}>
            {item.versionTitle}
          </Text>
          <Text color={'light.GreyText'} fontSize={RFValue(12)} fontFamily={'body'}>
            {item.comment1}
          </Text>
          <Text color={'light.GreyText'} fontSize={RFValue(12)} fontFamily={'body'}>
            {item.comment2}
          </Text>
          {item.comment3 ? (
            <Text color={'light.GreyText'} fontSize={RFValue(12)} fontFamily={'body'}>
              {item.comment3}
            </Text>
          ) : null}
        </Box>
      )}
      keyExtractor={(item) => item.id}
    />
  );
};
export default VersionHistoryList;
