import React from 'react';
import { Avatar, HStack, Text, VStack } from 'native-base';
import { View } from 'react-native';
import Cecked from 'src/assets/images/checked.svg';

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
      <Wrapper
        Profile={() => (
          <Avatar
            size="sm"
            bg="green.500"
            source={{
              uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
            }}
          />
        )}
        owner={'Julie Geller'}
        decription={'Friend'}
      />
      <Wrapper
        Profile={() => (
          <Avatar
            size="sm"
            bg="green.500"
            source={{
              uri: 'https://images.unsplash.com/photo-1614289371518-722f2615943d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
            }}
          />
        )}
        owner={'Gunther Greene'}
        decription={'Son-in-law'}
        checked
      />
      <Wrapper
        Profile={() => (
          <Avatar
            size="sm"
            bg="green.500"
            source={{
              uri: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
            }}
          />
        )}
        owner={'Arika Andler'}
        decription={'God-daughter'}
      />
      <Wrapper
        Profile={() => (
          <Avatar
            size="sm"
            bg="green.500"
            source={{
              uri: 'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
            }}
          />
        )}
        owner={'Huff Nohman'}
        decription={''}
      />
    </VStack>
  );
};

export default BenificiaryList;
