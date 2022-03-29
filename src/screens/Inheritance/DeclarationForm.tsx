import { Dimensions, Image } from 'react-native';
import React from 'react';
import { Avatar, Text, TextArea, VStack } from 'native-base';
import { ScrollView } from 'react-native-gesture-handler';

const { height } = Dimensions.get('window');

const DeclarationForm = () => {
  return (
    <ScrollView>
      <VStack marginY={'5'} marginLeft={'2'} marginTop={'10'}>
        <Avatar
          size="md"
          bg="green.500"
          source={{
            uri: 'https://images.unsplash.com/photo-1614289371518-722f2615943d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
          }}
        />
        <Text fontSize={'sm'}>{'Gunther Greene'}</Text>
        <Text fontSize={'xs'} fontFamily={'mono'}>
          {'Your Beneficiary'}
        </Text>
      </VStack>
      <TextArea h={height * 0.5} editable={false} borderWidth={0} textAlign={'left'}>
        {`I, Alex Geller (owner), being of sound mind and fully understanding the nature and extent of my property and this disposition therof, do hereby make, publish and declare this document to be my Hexa Keeper Inheritance Testament\n\n\nI hereby nominate and appoint Gunther Greene as the sole beneficiary\n\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`}
      </TextArea>
      <Text fontSize={'xs'} marginLeft={'5'}>
        {'Your Signature'}
      </Text>
      <Image source={require('src/assets/images/sign.png')} />
    </ScrollView>
  );
};

export default DeclarationForm;
