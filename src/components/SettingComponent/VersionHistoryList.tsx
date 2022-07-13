import React, { useContext } from 'react';
import { FlatList, Box, Text } from 'native-base';

import { RFValue } from 'react-native-responsive-fontsize';
import DotView from '../DotView';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
const data = [
  {
    id: 1,
    versionTitle: 'Version 1.0.9',
    comment1: 'App Enhancements',
    comment2: 'Bug Fixes',
    comment3: 'New Integration - Swan Bitcoin',
    date: '20 June ’21',
  },
  {
    id: 2,
    versionTitle: 'Version 1.0.8',
    comment1: 'App Enhancements',
    comment2: 'Bug Fixes',
    date: '15 March ’21',
  },
  {
    id: 3,
    versionTitle: 'Version 1.0.7',
    comment1: 'App Enhancements',
    comment2: 'Bug Fixes',
    date: '08 January ’21',
  },
  {
    id: 4,
    versionTitle: 'Version 1.0.6',
    comment1: 'App Enhancements',
    comment2: 'Bug Fixes',
    date: '28 December ’20',
  },
];
const VersionHistoryList = () => {
  const { useQuery } = useContext(RealmWrapperContext);
  const VersionHistoryData = useQuery(RealmSchema.VersionHistory).map(getJSONFromRealmObject);
  console.log('VersionHistoryData', VersionHistoryData);
  return (
    <FlatList
      style={{ overflow: 'visible' }}
      data={data}
      renderItem={({ item }) => (
        <Box borderLeftColor={'#E3BE96'} borderLeftWidth={1} w={'100%'} position="relative">
          <Box
            zIndex={99}
            position={'absolute'}
            left={-8}
            bg={'light.ReceiveBackground'}
            p={1}
            borderRadius={15}
          >
            <DotView height={2} width={2} color={'#E3BE96'} />
          </Box>
          <Text
            color={'light.GreyText'}
            fontSize={RFValue(10)}
            fontWeight={'300'}
            ml={5}
            opacity={0.7}
          >
            {item.date}
          </Text>
          <Box bg={'light.lightYellow'} p={5} borderRadius={10} my={2} ml={5}>
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
        </Box>
      )}
      keyExtractor={(item) => item.id}
    />
  );
};
export default VersionHistoryList;
