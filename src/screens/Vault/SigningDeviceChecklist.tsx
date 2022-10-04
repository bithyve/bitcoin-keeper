import { Box, FlatList, Text } from 'native-base';
import React, { useState } from 'react';

import DotView from 'src/components/DotView';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScrollView } from 'react-native';
import moment from 'moment';

const SigningDeviceChecklist = ({ date }) => {
  const [data, SetData] = useState([
    {
      id: '1',
      date: moment(date).calendar(),
      title: 'Health Check Successful',
      subTitle: 'Lorem ipsum dolor sit amet, cons ectetur adipiscing elit',
    },
  ]);

  return (
    <ScrollView style={{ overflow: 'visible' }}>
      {data.map((item) => (
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
      ))}
    </ScrollView>
  );
};
export default SigningDeviceChecklist;
