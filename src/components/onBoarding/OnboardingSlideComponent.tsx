import React from 'react';
import { Box, Text } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';
import { TouchableOpacity, Dimensions, StyleSheet } from 'react-native';

import Skip from 'src/assets/images/svgs/skip.svg';
import { hp } from 'src/common/data/responsiveness/responsive';

const { width } = Dimensions.get('window');

const OnboardingSlideComponent = (props) => {
  return (
    <Box style={styles.wrapper}>
      <Box style={styles.titleWrapper}>
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
      <Box style={styles.illustartionWrapper}>{props.illustration}</Box>
      <Box style={styles.paragraphWrapper}>
        <Text
          fontSize={RFValue(14)}
          color={'light.white'}
          fontFamily={'body'}
          textAlign={'center'}
          fontWeight={200}
          letterSpacing={1.4}
          maxWidth={hp(315)}
        >
          {props.paragraph}
        </Text>
      </Box>
      {props.currentPosition == 5 && (
        <Box justifyContent={'center'} mt={15}>
          <TouchableOpacity
            onPress={() => props.navigation.replace('NewKeeperApp')}
            style={styles.buttonWrapper}
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
const styles = StyleSheet.create({
  wrapper: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    flex: 1,
  },
  titleWrapper: {
    flex: 0.2,
  },
  illustartionWrapper: {
    flex: 0.6,
    justifyContent: 'center',
    marginTop: hp(-10),
  },
  paragraphWrapper: {
    flex: 0.3,
    justifyContent: 'center',
    marginTop: hp(40),
  },
  buttonWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});
export default OnboardingSlideComponent;
