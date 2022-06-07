import React, { useState, useContext, useEffect } from 'react';
import { Box, Text, Input } from 'native-base';

import { TouchableOpacity } from 'react-native-gesture-handler';
import { RFValue } from 'react-native-responsive-fontsize';
import CustomGreenButton from 'src/components/CustomButton/CustomGreenButton';

const FogotPassword = (props) => {
  const [clickStatus, setClickStatus] = useState('');
  const [seedWord, setSeedWord] = useState('');
  const [passwordText, setPasswordText] = useState('');
  return (
    <Box bg={'#F7F2EC'} p={10}>
      <TouchableOpacity onPress={() => props.closeBottomSheet()}>
        <Box
          bg={'#E3BE96'}
          borderRadius={32}
          h={8}
          w={8}
          alignItems={'center'}
          justifyContent={'center'}
          alignSelf={'flex-end'}
        >
          <Text fontSize={18} color={'#FFF'}>
            X
          </Text>
        </Box>
      </TouchableOpacity>
      <Text fontSize={RFValue(19)}>Forgot your passcode?</Text>
      <Text fontSize={RFValue(12)}>Lorem ipsum dolor sit amet, consectetur eiusmod tempor</Text>
      {clickStatus !== 'next' && (
        <Box>
          <Text fontSize={RFValue(13)} mt={10}>
            Enter the Third (03) word
          </Text>
          <Input
            onChangeText={(text) => setSeedWord(text)}
            borderWidth={0}
            borderRightRadius={10}
            placeholder="Enter Seed Word"
            placeholderTextColor={'#2F2F2F'}
            fontSize={13}
            fontWeight={'bold'}
            color={'#000000'}
            bg={'#FDF7F0'}
            pl={5}
            py={4}
            my={6}
          />
        </Box>
      )}
      {clickStatus == 'next' && (
        <Box>
          <Input
            onChangeText={(text) => setPasswordText(text)}
            borderWidth={0}
            borderRightRadius={10}
            placeholder="Enter Encryption Password"
            placeholderTextColor={'#2F2F2F'}
            fontSize={13}
            fontWeight={'bold'}
            color={'#000000'}
            bg={'#FDF7F0'}
            pl={5}
            py={4}
            my={6}
          />
        </Box>
      )}
      <Box alignSelf={'flex-end'}>
        {clickStatus !== 'next' ? (
          <CustomGreenButton
            onPress={() => {
              setClickStatus('next');
            }}
            value={'Proceed'}
          />
        ) : (
          <CustomGreenButton
            onPress={() => {
              props.closeBottomSheet();
              props.onNavigate();
            }}
            value={'Proceed'}
          />
        )}
      </Box>
    </Box>
  );
};
export default FogotPassword;
