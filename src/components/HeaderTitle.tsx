import { Box, useColorMode } from 'native-base';

import BackBlackButton from 'src/assets/images/back.svg';
import BackWhiteButton from 'src/assets/images/back_white.svg';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { windowHeight } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';

type Props = {
  title?: string;
  subtitle?: string | Element;
  onPressHandler?: () => void;
  enableBack?: boolean;
  headerTitleColor?: string;
  paddingLeft?: number;
  paddingTop?: number;
  learnMore?: boolean;
  learnMorePressed?: () => void;
  titleFontSize?: number;
  backBtnColor?: boolean;
  learnBackgroundColor?: string;
  learnTextColor?: string;
};
function HeaderTitle({
  title = '',
  subtitle = '',
  onPressHandler,
  enableBack = true,
  headerTitleColor = 'light.headerText',
  paddingLeft = 0,
  paddingTop = 0,
  learnMore = false,
  learnMorePressed = () => { },
  titleFontSize = 16,
  textPadding = 0,
  backBtnBlackColor = true,
  learnBackgroundColor = 'light.lightAccent',
  learnTextColor = 'light.learnMoreBorder',
}: Props) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  return (
    <Box style={styles.container}>
      {enableBack && (
        <Box
          style={[
            styles.backContainer,
            title && subtitle ? styles.backBtnVerticalPadding : styles.backBtnTopPadding,
          ]}
        >
          <TouchableOpacity onPress={onPressHandler || navigation.goBack} style={styles.backButton}>
            {colorMode === 'light' && backBtnBlackColor ? <BackBlackButton /> : <BackWhiteButton />}
          </TouchableOpacity>
          {learnMore && (
            <TouchableOpacity onPress={learnMorePressed} testID="btn_learnMore">
              <Box
                borderColor={
                  learnTextColor === 'light.white' ? 'light.white' : 'light.learnMoreBorder'
                }
                backgroundColor={learnBackgroundColor}
                style={styles.learnMoreContainer}
              >
                <Text color={learnTextColor} style={styles.learnMoreText}>
                  Learn More
                </Text>
              </Box>
            </TouchableOpacity>
          )}
        </Box>
      )}
      <Box style={styles.headerContainer}>
        <Box
          style={{
            paddingLeft,
            paddingTop,
          }}
        >
          {title && (
            <Text
              numberOfLines={1}
              style={[
                styles.addWalletText,
                { fontSize: titleFontSize, paddingHorizontal: textPadding },
              ]}
              color={headerTitleColor}
            >
              {title}
            </Text>
          )}
          {subtitle && (
            <Text
              style={[styles.addWalletDescription, { paddingHorizontal: textPadding }]}
              color={`${colorMode}.black`}
            >
              {subtitle}
            </Text>
          )}
        </Box>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  addWalletText: {
    lineHeight: 26,
    letterSpacing: 0.8,
  },
  addWalletDescription: {
    fontSize: 12,
    lineHeight: 20,
    letterSpacing: 0.5,
  },
  backContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  backBtnVerticalPadding: {
    paddingVertical: windowHeight > 680 ? 15 : 7,
  },
  backBtnTopPadding: {
    paddingTop: windowHeight > 680 ? 15 : 7,
  },
  backButton: {
    height: 20,
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  learnMoreContainer: {
    borderWidth: 0.5,
    borderRadius: 5,
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  learnMoreText: {
    fontSize: 12,
    letterSpacing: 0.6,
    alignSelf: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
export default HeaderTitle;
