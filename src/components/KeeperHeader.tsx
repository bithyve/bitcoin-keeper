import { Box, useColorMode } from 'native-base';
import React, { useContext } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import BackBlackButton from 'src/assets/images/back.svg';
import BackWhiteButton from 'src/assets/images/back_white.svg';
import { windowHeight, windowWidth, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import { LocalizationContext } from 'src/context/Localization/LocContext';

type Props = {
  title?: string;
  titleColor?: string;
  mediumTitle?: boolean;
  subtitle?: string;
  subTitleColor?: string;
  onPressHandler?: () => void;
  enableBack?: boolean;
  learnMore?: boolean;
  learnMorePressed?: () => void;
  learnBackgroundColor?: string;
  learnTextColor?: string;
  rightComponent?: Element;
  availableBalance?: Element;
  contrastScreen?: boolean;
  marginLeft?: boolean;
  icon?: Element;
  simple?: boolean;
};
function KeeperHeader({
  title = '',
  subtitle = '',
  titleColor,
  subTitleColor,
  mediumTitle = false,
  onPressHandler,
  enableBack = true,
  learnMore = false,
  learnMorePressed = () => {},
  learnBackgroundColor = 'light.BrownNeedHelp',
  learnTextColor = 'light.learnMoreBorder',
  rightComponent = null,
  availableBalance = null,
  contrastScreen = false,
  marginLeft = true,
  icon = null,
  simple = false,
}: Props) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const styles = getStyles(marginLeft);
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;

  if (simple) {
    return (
      <Box style={styles.simpleContainer}>
        {enableBack && (
          <TouchableOpacity
            testID="btn_back"
            onPress={onPressHandler || navigation.goBack}
            style={styles.simpleBackButton}
          >
            {colorMode === 'light' && !contrastScreen ? <BackBlackButton /> : <BackWhiteButton />}
          </TouchableOpacity>
        )}
        <Text
          style={styles.simpleTitleText}
          medium
          color={titleColor || `${colorMode}.headerText`}
          testID="text_header_title"
        >
          {title}
        </Text>
        <Box style={styles.rightComponentContainer}>{rightComponent}</Box>
      </Box>
    );
  }
  return (
    <Box style={styles.container}>
      {enableBack && (
        <Box style={styles.backContainer}>
          <TouchableOpacity
            testID="btn_back"
            onPress={onPressHandler || navigation.goBack}
            style={styles.backButton}
          >
            {colorMode === 'light' && !contrastScreen ? <BackBlackButton /> : <BackWhiteButton />}
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
                  {common.learnMore}
                </Text>
              </Box>
            </TouchableOpacity>
          )}
        </Box>
      )}
      <Box style={styles.headerContainer}>
        <Box style={styles.headerInfo}>
          {icon && icon}
          <Box>
            {title ? (
              <Text
                style={styles.addWalletText}
                color={titleColor || `${colorMode}.headerText`}
                testID="text_header_title"
                medium={mediumTitle}
              >
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text
                style={[styles.addWalletDescription, rightComponent && styles.smallWidth]}
                color={subTitleColor || `${colorMode}.black`}
                testID="text_header_subtitle"
              >
                {subtitle}
              </Text>
            ) : null}
          </Box>
        </Box>
        <Box>{rightComponent}</Box>
      </Box>
      <Box style={styles.availableBalance}>{availableBalance}</Box>
    </Box>
  );
}

const getStyles = (marginLeft: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: 'transparent',
    },
    simpleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 10,
    },
    simpleTitleText: {
      fontSize: 20,
      lineHeight: 24,
      textAlign: 'center',
      flex: 1,
    },
    simpleBackButton: {
      width: 20,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 10,
    },
    rightComponentContainer: {
      alignItems: 'flex-end',
    },
    addWalletText: {
      letterSpacing: 0.18,
      fontSize: 18,
    },
    addWalletDescription: {
      fontSize: 14,
      lineHeight: 18,
      width: windowWidth * 0.8,
    },
    backContainer: {
      justifyContent: 'space-between',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 5,
      paddingVertical: windowHeight > 680 ? 15 : 7,
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
      letterSpacing: 0.24,
      alignSelf: 'center',
    },
    headerContainer: {
      width: windowWidth * 0.85,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerInfo: {
      paddingLeft: marginLeft ? '10%' : '5%',
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center',
    },
    smallWidth: {
      width: windowWidth * 0.45,
    },
    availableBalance: {
      marginLeft: wp(68),
    },
  });

export default KeeperHeader;
