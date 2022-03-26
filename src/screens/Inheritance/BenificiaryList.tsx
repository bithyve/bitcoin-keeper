import React from 'react';
import { Avatar, HStack, Text, VStack } from 'native-base';

const Wrapper = ({ Profile, owner, decription }) => {
  return (
    <HStack padding={'4'} marginY={'4'} borderRadius={15} alignItems={'center'} bgColor={'#FDF7F0'}>
      <HStack alignItems={'center'}>
        <Profile />
        <VStack marginLeft={'5'}>
          <Text fontSize={'sm'}>{owner}</Text>
          <Text fontSize={'xs'} fontFamily={'mono'}>
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
        owner={'No backup created'}
        decription={'Lorem ipsum dolor sit amet'}
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
        owner={'No backup created'}
        decription={'Lorem ipsum dolor sit amet'}
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
        owner={'No backup created'}
        decription={'Lorem ipsum dolor sit amet'}
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
        owner={'No backup created'}
        decription={'Lorem ipsum dolor sit amet'}
      />
    </VStack>
  );
};

export default BenificiaryList;
