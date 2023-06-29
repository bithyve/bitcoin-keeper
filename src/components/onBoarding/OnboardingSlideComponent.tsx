import React from 'react';
import Text from 'src/components/KeeperText';
import { Box } from 'native-base';
import { TouchableOpacity, Dimensions, StyleSheet } from 'react-native';

import Skip from 'src/assets/images/skip.svg';
import { hp } from 'src/common/data/responsiveness/responsive';

const { width } = Dimensions.get('window');
function OnboardingSlideComponent(props) {
  return (
    <Box style={styles.wrapper}>
      <Box style={styles.titleWrapper}>
        <Text fontSize={18} color="light.primaryBackground" textAlign="center" letterSpacing={1.8}>
          {props.title}
        </Text>
      </Box>
      <Box style={styles.illustartionWrapper}>{props.illustration}</Box>
      <Box style={styles.paragraphWrapper}>
        <Text
          color="light.primaryBackground"
          style={styles.paragraphText}
        >
          {props.paragraph}
        </Text>
      </Box>
      {props.currentPosition === 5 && (
        <Box justifyContent="center" mt={15}>
          <TouchableOpacity
            onPress={() => props.navigation.reset({ index: 0, routes: [{ name: 'NewKeeperApp' }] })}
            style={styles.buttonWrapper}
          >
            <Text fontSize={14} color="light.primaryBackground" textAlign="center" bold>
              Start App&nbsp;&nbsp;
            </Text>
            <Skip />
          </TouchableOpacity>
        </Box>
      )}
    </Box>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    width,
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
  paragraphText: {
    fontSize: 14,
    textAlign: "center",
    letterSpacing: 1.4,
    marginHorizontal: 5
  },
  buttonWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});
export default OnboardingSlideComponent;
