import { Dimensions, Image } from 'react-native';
import React from 'react';
import { Avatar, Text, TextArea, VStack } from 'native-base';
import { ScrollView } from 'react-native-gesture-handler';

const { height } = Dimensions.get('window');

const TransferState = ({ setTransfer, transferDescription }) => {
  return (
    <ScrollView>
      <VStack
        marginY={'5'}
        marginLeft={'2'}
        marginTop={'10'}
        bg={'#FDF6F0'}
        padding={'6'}
        borderRadius={10}
      >
        <Text fontSize={'sm'} fontFamily={'body'} fontWeight={'200'}>
          {'Gunther Greene'}
        </Text>
        <Text fontSize={'xs'} fontFamily={'body'} fontWeight={'100'}>
          {'Your Beneficiary'}
        </Text>
      </VStack>
      <Text
        fontFamily={'body'}
        fontWeight={'200'}
        fontSize={'xs'}
        marginLeft={'5'}
        marginTop={'5'}
        noOfLines={2}
        letterSpacing={0.6}
      >
        {transferDescription}
      </Text>
    </ScrollView>
  );
};

export default TransferState;
