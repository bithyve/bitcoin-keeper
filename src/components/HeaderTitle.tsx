import { Box } from 'native-base';

import BackBlackButton from 'src/assets/images/back.svg';
import BackWhiteButton from 'src/assets/images/back_white.svg';
import React from 'react';
import { ScaledSheet } from 'react-native-size-matters';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { windowHeight } from 'src/common/data/responsiveness/responsive';
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
  learnTextColor = 'light.learnMoreBorder'
}: Props) {
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
            {backBtnBlackColor ? <BackBlackButton /> : <BackWhiteButton />}
          </TouchableOpacity>
          {learnMore && (
            <TouchableOpacity onPress={learnMorePressed} testID="btn_learnMore">
              <Box
                borderColor={learnTextColor === "light.white" ? "light.white" : "light.learnMoreBorder"}
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
              color="light.primaryText"
            >
              {subtitle}
            </Text>
          )}
        </Box>
      </Box>
    </Box>
  );
}

const styles = ScaledSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  addWalletText: {
    lineHeight: '23@s',
    letterSpacing: '0.8@s',
    // paddingHorizontal: '20@s',
  },
  addWalletDescription: {
    fontSize: 12,
    lineHeight: '17@s',
    letterSpacing: '0.5@s',
    // paddingHorizontal: '20@s',
    fontWeight: '200',
  },
  backContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '5@s',
  },
  backBtnVerticalPadding: {
    paddingVertical: windowHeight > 680 ? '15@s' : '7@s',
  },
  backBtnTopPadding: {
    paddingTop: windowHeight > 680 ? '15@s' : '7@s',
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
