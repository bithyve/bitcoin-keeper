import { Box, Pressable, Text, VStack } from 'native-base';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

import HeaderTitle from 'src/components/HeaderTitle';
import Note from 'src/components/Note/Note';
import React from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { StyleSheet } from 'react-native';

const Card = ({ message, buttonText, buttonCallBack }) => {
  return (
    <Box
      backgroundColor={'light.lightYellow'}
      height={hp(100)}
      width={'100%'}
      borderRadius={10}
      justifyContent={'center'}
      marginY={6}
    >
      <Box
        style={{
          paddingHorizontal: wp(20),
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text
          color={'light.modalText'}
          fontSize={13}
          letterSpacing={0.65}
          fontWeight={200}
          noOfLines={2}
          width={'70%'}
        >
          {message}
        </Text>
        <Pressable
          bg={'light.yellow1'}
          justifyContent={'center'}
          borderRadius={5}
          width={wp(60)}
          height={hp(25)}
          alignItems={'center'}
          onPress={buttonCallBack}
        >
          <Text fontSize={12} letterSpacing={0.65} fontWeight={200}>
            {buttonText}
          </Text>
        </Pressable>
      </Box>
    </Box>
  );
};

const SignWithColdCard = ({ route }) => {
  return (
    <ScreenWrapper>
      <VStack justifyContent={'space-between'} flex={1}>
        <VStack>
          <HeaderTitle title="Register Device" subtitle="Lorem ipsum dolor sit amet" />
          <Card
            message={'Register the vault with this MK4'}
            buttonText={'Scan'}
            buttonCallBack={() => {}}
          />
          <HeaderTitle
            title="Sign Transaction"
            subtitle="Lorem ipsum dolor sit amet"
            enableBack={false}
          />
          <Card
            message={'Send Assigned PSBT Lorem ipsum dolor sit amet, consectetur adipiscing elit,'}
            buttonText={'Send'}
            buttonCallBack={() => {}}
          />
          <Card
            message={
              'Receive Assigned PSBT Lorem ipsum dolor sit amet, consectetur adipiscing elit,'
            }
            buttonText={'Receive'}
            buttonCallBack={() => {}}
          />
        </VStack>
        <VStack>
          <Note title="Note" subtitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit" />
        </VStack>
      </VStack>
    </ScreenWrapper>
  );
};

export default SignWithColdCard;

const styles = StyleSheet.create({});
