import { Dimensions, Image } from 'react-native';
import React from 'react';
import { Avatar, Text, TextArea, VStack } from 'native-base';
import { ScrollView } from 'react-native-gesture-handler';

const { height } = Dimensions.get('window');

const DeclarationForm = () => {
  return (
    <ScrollView>
      <VStack marginY={'5'} marginLeft={'2'} marginTop={'10'}>
        {/* <Avatar
          size="md"
          bg="green.500"
          source={{
            uri: 'https://images.unsplash.com/photo-1614289371518-722f2615943d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
          }}
        /> */}
        <Text fontSize={'sm'} fontFamily={'body'} fontWeight={'200'}>
          {'Gunther Greene'}
        </Text>
        <Text fontSize={'xs'} fontFamily={'body'} fontWeight={'100'}>
          {'Your Beneficiary'}
        </Text>
      </VStack>
      <TextArea
        fontSize={'xs'}
        fontFamily={'body'}
        fontWeight={'200'}
        h={height * 0.2}
        editable={false}
        borderWidth={0}
        textAlign={'left'}
        letterSpacing={0.7}
        lineHeight={17}
      >
        {`This letter is a declaration that I, Alex Geller, wish to leave behind the sum of 7.2 bitcoin to my son Gunther Greene.\n\nI attest that I’m voluntarily choosing to bequeath this wealth to my son and am under no obligation or influence of any kind to do so. Your Signature`}
      </TextArea>
      <Text fontFamily={'body'} fontWeight={'200'} fontSize={'xs'} marginLeft={'5'}>
        {'Your Signature'}
      </Text>
      <Image source={require('src/assets/images/sign.png')} />
    </ScrollView>
  );
};

export default DeclarationForm;
