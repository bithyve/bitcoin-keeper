import React, { useContext } from 'react';
import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';
import { TouchableOpacity, Dimensions, StyleSheet } from 'react-native';

import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import Fonts from 'src/constants/Fonts';
import ThemedColor from '../ThemedColor/ThemedColor';
import ThemedSvg from '../ThemedSvg.tsx/ThemedSvg';

const { width } = Dimensions.get('window');
function OnboardingSlideComponent(props) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const onBording_Text_Color = ThemedColor({ name: 'onBording_Text_Color' });

  return (
    <Box style={styles.wrapper}>
      <Box style={styles.titleWrapper}>
        <Text
          fontSize={24}
          color={onBording_Text_Color}
          textAlign="center"
          letterSpacing={0.2}
          semiBold
          style={styles.titleText}
        >
          {props.title}
        </Text>
      </Box>
      <Box style={styles.illustartionWrapper}>{props.illustration}</Box>
      <Box style={styles.paragraphWrapper}>
        <Text color={onBording_Text_Color} style={styles.paragraphText}>
          {props.paragraph}
        </Text>
      </Box>
      {props.currentPosition === 5 && (
        <Box justifyContent="center" mt={15}>
          <TouchableOpacity
            onPress={() => props.navigation.reset({ index: 0, routes: [{ name: 'NewKeeperApp' }] })}
            style={styles.buttonWrapper}
            testID={'btn_startApp'}
          >
            <Text fontSize={14} color={`${colorMode}.primaryBackground`} textAlign="center" bold>
              {common.StartApp}&nbsp;&nbsp;
            </Text>
            <ThemedSvg name={'skip_icon'} />
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
    paddingHorizontal: 5,
    paddingBottom: 5,
    paddingTop: 40,
    flex: 1,
  },
  titleWrapper: {
    marginHorizontal: hp(20),
  },
  illustartionWrapper: {
    flex: 0.6,
    justifyContent: 'center',
    marginTop: hp(25),
  },
  paragraphWrapper: {
    flex: 0.3,
    justifyContent: 'center',
    marginTop: hp(40),
    marginHorizontal: hp(25),
  },
  paragraphText: {
    fontSize: 14,
    textAlign: 'center',
    letterSpacing: 0.14,
    marginHorizontal: 5,
    opacity: 1,
  },
  buttonWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  titleText: {
    fontFamily: Fonts.LoraMedium,
  },
});
export default OnboardingSlideComponent;
