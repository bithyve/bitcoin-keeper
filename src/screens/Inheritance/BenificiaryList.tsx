import React from 'react';
import { Avatar, HStack, Text, VStack } from 'native-base';
import { View } from 'react-native';
import Cecked from 'src/assets/images/checked.svg';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';

const Wrapper = ({ Profile, owner, decription, checked = false }) => {
  return (
    <HStack alignItems={'center'}>
      {checked ? (
        <Cecked />
      ) : (
        <View
          style={{
            height: 12,
            width: 12,
            borderRadius: 4,
            backgroundColor: '#F3DFCB',
            marginRight: 15,
          }}
        />
      )}
      <HStack
        padding={'4'}
        marginY={'4'}
        borderRadius={15}
        alignItems={'center'}
        bgColor={'#FDF7F0'}
        w={'90%'}
      >
        <Profile />
        <VStack marginLeft={'5'}>
          <Text fontSize={'sm'} fontFamily={'body'} fontWeight={'200'}>
            {owner}
          </Text>
          <Text fontFamily={'body'} fontWeight={'100'} fontSize={'xs'}>
            {decription}
          </Text>
        </VStack>
      </HStack>
    </HStack>
  );
};
const BenificiaryList = () => {
  return (
    <VStack flex={1}>
      <BottomSheetTextInput
        placeholder="Name"
        selectionColor={'#073E39'}
        style={{
          height: 45,
          backgroundColor: '#fdf6f0',
          color: '#073E39',
          borderRadius: 10,
          paddingHorizontal: 10,
          marginTop: 30,
        }}
      />
      <BottomSheetTextInput
        placeholder="Email"
        selectionColor={'#073E39'}
        style={{
          height: 45,
          backgroundColor: '#fdf6f0',
          color: '#073E39',
          borderRadius: 10,
          paddingHorizontal: 10,
          marginTop: 30,
        }}
      />
      <BottomSheetTextInput
        placeholder="Address"
        selectionColor={'#073E39'}
        style={{
          height: 45,
          backgroundColor: '#fdf6f0',
          color: '#073E39',
          borderRadius: 10,
          paddingHorizontal: 10,
          marginTop: 30,
        }}
      />
    </VStack>
  );
};

export default BenificiaryList;
