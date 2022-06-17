import { Dimensions, Image } from 'react-native';
import React, { useContext } from 'react';
import { Avatar, Text, TextArea, VStack } from 'native-base';
import { ScrollView } from 'react-native-gesture-handler';
import { LocalizationContext } from 'src/common/content/LocContext';
const { height } = Dimensions.get('window');

const DeclarationForm = () => {

  const { translations } = useContext( LocalizationContext )
  const home = translations[ 'home' ]

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
          {home.DelarationName}
        </Text>
        <Text fontSize={'xs'} fontFamily={'body'} fontWeight={'100'}>
          {home.YourBeneficiary}
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
        {home.Delarationdesc}
      </TextArea>
      <Text fontFamily={'body'} fontWeight={'200'} fontSize={'xs'} marginLeft={'5'}>
        {home.YourSignature}
      </Text>
      <Image source={require('src/assets/images/sign.png')} />
    </ScrollView>
  );
};

export default DeclarationForm;
