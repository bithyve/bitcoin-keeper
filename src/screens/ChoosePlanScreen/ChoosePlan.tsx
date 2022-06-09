import React from 'react';
import { Box, Text, StatusBar } from 'native-base';
import { SafeAreaView, TouchableOpacity } from 'react-native';

import { RFValue } from 'react-native-responsive-fontsize';

import BackIcon from 'src/assets/icons/back.svg';
import CurrencyTypeSwitch from 'src/components/Switch/CurrencyTypeSwitch';
import ChoosePlanCarousel from 'src/components/Carousel/ChoosePlanCarousel';
import Note from 'src/components/Note/Note';
import DotView from 'src/components/DotView';

const ChoosePlan = (props) => {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#F7F2EC',
      }}
    >
      <StatusBar backgroundColor={'#F7F2EC'} barStyle="dark-content" />
      <Box mx={5} my={10}>
        <TouchableOpacity onPress={() => props.navigation.goBack()}>
          <BackIcon />
        </TouchableOpacity>
      </Box>
      <Box ml={10} mb={5} flexDirection={'row'} w={'100%'} alignItems={'center'}>
        <Box w={'60%'}>
          <Text fontSize={RFValue(20)} color={'light.textBlack'}>
            Choose your plan
          </Text>
          <Text fontSize={RFValue(12)} color={'light.GreyText'}>
            Lorem ipsum dolor sit amet{' '}
          </Text>
        </Box>
        <Box alignItems={'center'} justifyContent={'center'} w={'30%'}>
          <CurrencyTypeSwitch />
        </Box>
      </Box>
      <ChoosePlanCarousel />
      <Box mx={10} my={5}>
        <Text fontSize={RFValue(14)} color={'light.lightBlack'} fontWeight={'bold'}>
          Benefits of going Pro
        </Text>
        <Text fontSize={RFValue(12)} color={'light.GreyText'}>
          Lorem ipsum dolor sit amet
        </Text>
      </Box>
      <Box mx={12}>
        <Box flexDirection={'row'} alignItems={'center'}>
          <DotView height={2} width={2} />
          <Text fontSize={RFValue(13)} color={'light.GreyText'} mb={2} ml={3}>
            incididunt ut labore et dolore magna
          </Text>
        </Box>
        <Box flexDirection={'row'} alignItems={'center'}>
          <DotView height={2} width={2} />
          <Text fontSize={RFValue(13)} color={'light.GreyText'} mb={2} ml={3}>
            aliqua. Ut enim ad minim veniam
          </Text>
        </Box>
        <Box flexDirection={'row'} alignItems={'center'}>
          <DotView height={2} width={2} />
          <Text fontSize={RFValue(13)} color={'light.GreyText'} mb={2} ml={3}>
            quis nostrud exercitation ullamco
          </Text>
        </Box>
      </Box>
      <Box flex={1} justifyContent={'flex-end'}>
        <Note
          title={'Note'}
          subtitle={
            'This purchase would be made on the App Store Lorem ipsum dolor sit amet, consectetur adipiscing elit'
          }
        />
      </Box>
    </SafeAreaView>
  );
};
export default ChoosePlan;
