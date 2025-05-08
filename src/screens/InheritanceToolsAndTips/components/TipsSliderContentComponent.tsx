import React from 'react';
import Text from 'src/components/KeeperText';
import { Box, ScrollView, useColorMode } from 'native-base';
import { Dimensions, StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');
function OnboardingSlideComponent(props) {
  const { colorMode } = useColorMode();
  const themeMode = useSelector((state: any) => state?.settings?.themeMode);
  const privateThemeLight = themeMode === 'PRIVATE_LIGHT';
  return (
    <ScrollView>
      <Box style={styles.wrapper}>
        <Text
          semiBold
          width={'80%'}
          fontSize={20}
          mb={hp(15)}
          color={privateThemeLight ? `${colorMode}.textBlack` : `${colorMode}.headerWhite`}
          letterSpacing={0.2}
        >
          {props.title}
        </Text>
        <Box width={'90%'}>
          <Text color={privateThemeLight ? `${colorMode}.textBlack` : `${colorMode}.headerWhite`}>
            {props.paragraph}
          </Text>
        </Box>
        <Box style={styles.icon}>{props.icon}</Box>
        <Box width={'90%'}>
          <Text color={privateThemeLight ? `${colorMode}.textBlack` : `${colorMode}.headerWhite`}>
            {props.paragraph2}
          </Text>
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
