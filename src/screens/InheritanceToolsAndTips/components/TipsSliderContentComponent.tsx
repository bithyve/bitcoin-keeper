import React from 'react';
import Text from 'src/components/KeeperText';
import { Box, ScrollView, useColorMode } from 'native-base';
import { Dimensions, StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';

const { width } = Dimensions.get('window');
function OnboardingSlideComponent(props) {
  const { colorMode } = useColorMode();
  return (
    <ScrollView>
      <Box style={styles.wrapper}>
        <Text
          semiBold
          width={'80%'}
          fontSize={20}
          mb={hp(15)}
          color={`${colorMode}.modalGreenContent`}
          letterSpacing={0.2}
        >
          {props.title}
        </Text>
        <Box width={'90%'}>
          <Text color={`${colorMode}.modalGreenContent`}>{props.paragraph}</Text>
        </Box>
        <Box style={styles.icon}>{props.icon}</Box>
        <Box width={'90%'}>
          <Text color={`${colorMode}.modalGreenContent`}>{props.paragraph2}</Text>
        </Box>
      </Box>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    width,
    paddingHorizontal: 5,
    paddingBottom: 5,
    paddingTop: 40,
    flex: 1,
  },
  icon: {
    marginVertical: hp(20),
    marginRight: wp(30),
    alignItems: 'center',
  },
});
export default OnboardingSlideComponent;
