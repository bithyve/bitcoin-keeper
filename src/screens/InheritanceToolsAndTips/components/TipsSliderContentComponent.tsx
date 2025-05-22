import React from 'react';
import Text from 'src/components/KeeperText';
import { Box, ScrollView } from 'native-base';
import { Dimensions, StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import ThemedColor from 'src/components/ThemedColor/ThemedColor';

const { width } = Dimensions.get('window');
function OnboardingSlideComponent(props) {
  const green_modal_text_color = ThemedColor({ name: 'green_modal_text_color' });

  return (
    <ScrollView>
      <Box style={styles.wrapper}>
        <Text
          semiBold
          width={'80%'}
          fontSize={20}
          mb={hp(15)}
          color={green_modal_text_color}
          letterSpacing={0.2}
        >
          {props.title}
        </Text>
        <Box width={'90%'}>
          <Text color={green_modal_text_color}>{props.paragraph}</Text>
        </Box>
        <Box style={styles.icon}>{props.icon}</Box>
        <Box width={'90%'}>
          <Text color={green_modal_text_color}>{props.paragraph2}</Text>
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
