import React from 'react';
import { Box, Text } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';
import { TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window')

const OnboardingSlideComponent = (props) => {
  return (
    <Box width={width} alignItems={'center'} p={5}>
      <Box>
        <Text fontSize={RFValue(14)} color={'light.white'} fontFamily={'body'} textAlign={'center'}>
          {props.title}
        </Text>
      </Box>
      <Box my={10}>{props.illustration}</Box>
      <Box>
        <Text fontSize={RFValue(14)} color={'light.white'} fontFamily={'body'} textAlign={'center'}>
          {props.paragraph}
        </Text>
      </Box>
      {props.position && (
        <Box justifyContent={'center'} mt={10}>
          <TouchableOpacity onPress={() => props.navigation.replace('App')}>
            <Text
              fontSize={RFValue(16)}
              color={'light.white'}
              // fontFamily={'heading'}
              textAlign={'center'}
              fontWeight={300}
            >
              Start App {'>>'}
            </Text>
          </TouchableOpacity>
        </Box>
      )}
    </Box>
  );
};
export default OnboardingSlideComponent;
