import React from 'react';
import { Box, Text } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';
import { TouchableOpacity, Dimensions } from 'react-native';

import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

import Skip from 'src/assets/images/svgs/skip.svg';

const { width } = Dimensions.get('window');

const OnboardingSlideComponent = (props) => {
  return (
    <Box width={width} alignItems={'center'} justifyContent={'center'} p={5} flex={1}>
      <Box flex={0.2}>
        <Text
          fontSize={RFValue(18)}
          color={'light.white'}
          fontFamily={'heading'}
          textAlign={'center'}
          fontWeight={200}
          letterSpacing={1.8}
        >
          {props.title}
        </Text>
      </Box>
      <Box flex={0.6} justifyContent={'center'} mt={props.currentPosition >= 1 ? hp(3) : 0}>
        {props.illustration}
      </Box>
      <Box flex={0.2} justifyContent={'center'}>
        <Text
          fontSize={RFValue(14)}
          color={'light.white'}
          fontFamily={'body'}
          textAlign={'center'}
          fontWeight={200}
          letterSpacing={1.4}
        >
          {props.paragraph}
        </Text>
      </Box>
      {props.currentPosition == 5 && (
        <Box justifyContent={'center'} mt={15}>
          <TouchableOpacity
            onPress={() => props.navigation.replace('NewKeeperApp')}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}
          >
            <Text
              fontSize={RFValue(14)}
              color={'light.white'}
              fontFamily={'heading'}
              textAlign={'center'}
              fontWeight={300}
            >
              Start App&nbsp;&nbsp;
            </Text>
            <Skip />
          </TouchableOpacity>
        </Box>
      )}
    </Box>
  );
};
export default OnboardingSlideComponent;
