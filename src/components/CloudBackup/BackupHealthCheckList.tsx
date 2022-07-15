import React, { useState } from 'react';
import { FlatList, Box, Text } from 'native-base';

import { RFValue } from 'react-native-responsive-fontsize';
import DotView from '../DotView';

const BackupHealthCheckList = () => {
  const [data, SetData] = useState([
    {
      id: '1',
      date: '15 March ’21',
      title: 'Health Check Successful',
      subTitle: 'Lorem ipsum dolor sit amet, cons ectetur adipiscing elit',
    },
    {
      id: '2',
      date: '15 January ’21',
      title: 'Health Check Skipped',
      subTitle: 'Lorem ipsum dolor sit amet, cons ectetur adipiscing elit',
    },
  ]);

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
              {item.title}
            </Text>
            <Text color={'light.GreyText'} fontSize={RFValue(12)} fontFamily={'body'}>
              {item.subTitle}
            </Text>
          </Box>
        </Box>
      )}
      keyExtractor={(item) => item.id}
    />
  );
};
export default BackupHealthCheckList;
