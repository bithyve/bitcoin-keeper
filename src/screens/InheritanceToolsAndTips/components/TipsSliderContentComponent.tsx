import React from 'react';
import Text from 'src/components/KeeperText';
import { Box, ScrollView } from 'native-base';
import { Dimensions, StyleSheet } from 'react-native';
import { hp } from 'src/constants/responsive';

const { width } = Dimensions.get('window');
function OnboardingSlideComponent(props) {
  return (
    <ScrollView>
      <Box style={styles.wrapper}>
        <Text
          semiBold
          width={'80%'}
          fontSize={20}
          mb={hp(15)}
          color="light.primaryBackground"
          letterSpacing={0.2}
        >
          {props.title}
        </Text>
        <Box width={'90%'}>
          <Text color="light.primaryBackground">{props.paragraph}</Text>
        </Box>
        <Box style={styles.icon}>{props.icon}</Box>
        <Box width={'90%'}>
          <Text color="light.primaryBackground">{props.paragraph2}</Text>
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
    alignItems: 'center',
  },
});
export default OnboardingSlideComponent;
