import { Box, useColorMode } from 'native-base';
import React, { useContext, useMemo } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import BackBlackButton from 'src/assets/images/back.svg';
import BackWhiteButton from 'src/assets/images/back_white.svg';
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import { LocalizationContext } from 'src/context/Localization/LocContext';

type Props = {
  title?: string;
  titleColor?: string;
  titleSize?: number;
  mediumTitle?: boolean;
  subtitle?: string;
  subTitleColor?: string;
  subTitleSize?: number;
  onPressHandler?: () => void;
  enableBack?: boolean;
  learnMore?: boolean;
  learnMorePressed?: () => void;
  learnBackgroundColor?: string;
  learnMoreBorderColor?: string;
  learnTextColor?: string;
  rightComponent?: Element;
  availableBalance?: Element;
  contrastScreen?: boolean;
  icon?: Element;
  simple?: boolean;
  rightComponentPadding?: number | `${number}%`;
  rightComponentBottomPadding?: number | `${number}%`;
  headerInfoPadding?: number | `${number}%`;
  topRightComponent?: Element;
};

function BackButton({ onPress, colorMode, contrastScreen, styles }: any) {
  return (
    <Box style={styles.backButtonWrapper}>
      <TouchableOpacity testID="btn_back" onPress={onPress} style={styles.backButton}>
        {colorMode === 'light' && !contrastScreen ? <BackBlackButton /> : <BackWhiteButton />}
      </TouchableOpacity>
    </Box>
  );
}

function LearnMoreButton({
  onPress,
  learnBackgroundColor,
  learnTextColor,
  learnMoreBorderColor,
  colorMode,
  common,
  styles,
}: any) {
  return (
    <Box style={styles.learnMoreButtonWrapper}>
      <TouchableOpacity onPress={onPress} testID="btn_learnMore" style={styles.learnMoreButton}>
        <Box
          borderColor={
            learnMoreBorderColor ||
            (learnTextColor === 'light.white' || learnTextColor === 'light.buttonText'
              ? 'light.white'
              : `${colorMode}.learnMoreBorder`)
          }
          backgroundColor={
            learnBackgroundColor === 'BrownNeedHelp'
              ? `${colorMode}.BrownNeedHelp`
              : learnBackgroundColor
          }
          style={styles.learnMoreContainer}
        >
          <Text
            color={learnTextColor || `${colorMode}.learnMoreBorder`}
            style={styles.learnMoreText}
          >
            {common.learnMore}
          </Text>
        </Box>
      </TouchableOpacity>
    </Box>;
  );
}

function HeaderInfo({
  title,
  subtitle,
  titleColor,
  subTitleColor,
  mediumTitle,
  rightComponent,
  icon,
  colorMode,
  styles,
}: any) {
  return (
    <Box style={styles.headerInfo}>
      {icon && icon}
      <Box style={styles.headerInfoText}>
        {title && (
          <Text
            style={styles.addWalletText}
            color={titleColor || `${colorMode}.headerText`}
            testID="text_header_title"
            medium={mediumTitle}
          >
            {title}
          </Text>
        )}
        {subtitle ? (
          <Text
            style={[styles.addWalletDescription, rightComponent && styles.smallWidth]}
            color={subTitleColor || `${colorMode}.black`}
            testID="text_header_subtitle"
          >
            {subtitle}
          </Text>
        ) : (
          <Box style={{ marginBottom: hp(8) }} />
        )}
      </Box>
    </Box>
  );
}

function KeeperHeader({
  title = '',
  subtitle = '',
  titleColor,
  subTitleColor,
  titleSize = 20,
  subTitleSize = 14,
  mediumTitle = false,
  onPressHandler,
  enableBack = true,
  learnMore = false,
  learnMorePressed = () => {},
  learnBackgroundColor = 'BrownNeedHelp',
  learnMoreBorderColor,
  learnTextColor,
  rightComponent = null,
  availableBalance = null,
  contrastScreen = false,
  icon = null,
  rightComponentPadding = -22,
  rightComponentBottomPadding = -10,
  headerInfoPadding = 8,
  simple = false,
  topRightComponent = null,
}: Props) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;

  const styles = useMemo(
    () =>
      getStyles(
        rightComponentPadding,
        rightComponentBottomPadding,
        headerInfoPadding,
        titleSize,
        subTitleSize
      ),
    [rightComponentPadding, rightComponentBottomPadding, headerInfoPadding, titleSize, subTitleSize]
  );

  if (simple) {
    return (
      <Box style={styles.simpleContainer}>
        {enableBack && (
          <Box style={styles.backButtonWrapper}>
            <TouchableOpacity
              testID="btn_back"
              onPress={onPressHandler || navigation.goBack}
              style={styles.backButton}
            >
              {colorMode === 'light' && !contrastScreen ? <BackBlackButton /> : <BackWhiteButton />}
            </TouchableOpacity>
          </Box>
        )}
        <Text
          style={styles.simpleTitleText}
          medium
          color={titleColor || `${colorMode}.headerText`}
          testID="text_header_title"
        >
          {title}
        </Text>
        {rightComponent ? (
          <Box style={styles.rightComponentContainer}>{rightComponent}</Box>
        ) : (
          <Box style={styles.placeholder} />
        )}
      </Box>
    );
  }

  return (
    <Box style={styles.container}>
      {enableBack && (
        <Box style={styles.backContainer}>
          <BackButton
            onPress={onPressHandler || navigation.goBack}
            colorMode={colorMode}
            contrastScreen={contrastScreen}
            styles={styles}
          />
          {learnMore && !topRightComponent && (
            <LearnMoreButton
              onPress={learnMorePressed}
              learnBackgroundColor={learnBackgroundColor}
              learnMoreBorderColor={learnMoreBorderColor}
              learnTextColor={learnTextColor}
              common={common}
              styles={styles}
              colorMode={colorMode}
            />
          )}
          {topRightComponent && <Box style={styles.topRightContainer}>{topRightComponent}</Box>}
        </Box>
      )}
      <Box style={styles.headerContainer}>
        <HeaderInfo
          title={title}
          subtitle={subtitle}
          titleColor={titleColor}
          subTitleColor={subTitleColor}
          mediumTitle={mediumTitle}
          rightComponent={rightComponent}
          icon={icon}
          colorMode={colorMode}
          styles={styles}
        />
        <Box style={styles.rightComponent}>{rightComponent}</Box>
      </Box>
      {availableBalance && <Box style={styles.availableBalance}>{availableBalance}</Box>}
    </Box>
  );
}

const getStyles = (
  rightComponentPadding: number | `${number}%`,
  rightComponentBottomPadding: number | `${number}%`,
  headerInfoPadding: number | `${number}%`,
  titleSize: number,
  subTitleSize: number
) =>
  StyleSheet.create({
    container: {
      backgroundColor: 'transparent',
    },
    simpleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
    },
    simpleTitleText: {
      fontSize: 20,
      lineHeight: 24,
      textAlign: 'center',
      flex: 1,
    },
    backButtonWrapper: {
      width: 20,
      height: 20,
      position: 'relative',
    },
    backButton: {
      position: 'absolute',
      height: 44,
      width: 44,
      justifyContent: 'center',
      alignItems: 'center',
      top: -22 + 10,
      left: -22 + 14,
    },
    learnMoreButtonWrapper: {
      width: 83,
      height: 10,
      position: 'relative',
    },
    learnMoreButton: {
      position: 'absolute',
      height: 26,
      width: 83,
      justifyContent: 'center',
      alignItems: 'center',
      top: -22 + 14,
      left: 0,
    },
    rightComponentContainer: {
      alignItems: 'flex-end',
    },
    placeholder: {
      width: 20,
    },
    addWalletText: {
      fontSize: titleSize,
    },
    addWalletDescription: {
      fontSize: subTitleSize,
      lineHeight: 18,
      width: windowWidth * 0.8,
      marginTop: hp(5),
    },
    backContainer: {
      justifyContent: 'space-between',
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: windowHeight > 680 ? 15 : 7,
    },
    learnMoreContainer: {
      height: '100%',
      width: '100%',
      borderWidth: 0.5,
      borderRadius: 5,
      justifyContent: 'center',
      alignItems: 'center',
    },
    learnMoreText: {
      fontSize: 12,
      alignSelf: 'center',
    },
    headerContainer: {
      paddingTop: hp(25),
      width: windowWidth * 0.9,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'relative',
    },
    headerInfo: {
      flex: 1,
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center',
      paddingLeft: headerInfoPadding,
    },
    headerInfoText: {
      flex: 1,
    },
    smallWidth: {
      width: windowWidth * 0.5,
      flexShrink: 1,
    },
    rightComponent: {
      position: 'absolute',
      right: rightComponentPadding,
      bottom: rightComponentBottomPadding,
    },
    availableBalance: {
      marginLeft: wp(61),
    },
    topRightContainer: {
      zIndex: 10,
    },
  });

export default KeeperHeader;
