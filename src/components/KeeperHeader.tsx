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
  icon?: Element;
  simple?: boolean;
  rightComponentPadding?: number | `${number}%`;
  headerInfoPadding?: number | `${number}%`;
};

const BackButton = ({ onPress, colorMode, contrastScreen, styles }: any) => (
  <TouchableOpacity testID="btn_back" onPress={onPress} style={styles.backButton}>
    {colorMode === 'light' && !contrastScreen ? <BackBlackButton /> : <BackWhiteButton />}
  </TouchableOpacity>
);

const LearnMoreButton = ({
  onPress,
  learnBackgroundColor,
  learnTextColor,
  common,
  styles,
}: any) => (
  <TouchableOpacity onPress={onPress} testID="btn_learnMore">
    <Box
      borderColor={learnTextColor === 'light.white' ? 'light.white' : 'light.learnMoreBorder'}
      backgroundColor={learnBackgroundColor}
      style={styles.learnMoreContainer}
    >
      <Text color={learnTextColor} style={styles.learnMoreText}>
        {common.learnMore}
      </Text>
    </Box>
  </TouchableOpacity>
);

const HeaderInfo = ({
  title,
  subtitle,
  titleColor,
  subTitleColor,
  mediumTitle,
  rightComponent,
  icon,
  colorMode,
  styles,
}: any) => (
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
      {subtitle && (
        <Text
          style={[styles.addWalletDescription, rightComponent && styles.smallWidth]}
          color={subTitleColor || `${colorMode}.black`}
          testID="text_header_subtitle"
        >
          {subtitle}
        </Text>
      )}
    </Box>
  </Box>
);

const KeeperHeader = ({
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
  icon = null,
  rightComponentPadding = 0,
  headerInfoPadding = 10,
  simple = false,
}: Props) => {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;

  const styles = useMemo(
    () => getStyles(rightComponentPadding, headerInfoPadding),
    [rightComponentPadding, headerInfoPadding]
  );

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
        {rightComponent ? (
          <Box style={styles.rightComponentContainer}>{rightComponent}</Box>
        ) : (
          <Box style={styles.placeholder}></Box>
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
          {learnMore && (
            <LearnMoreButton
              onPress={learnMorePressed}
              learnBackgroundColor={learnBackgroundColor}
              learnTextColor={learnTextColor}
              common={common}
              styles={styles}
            />
          )}
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
};

const getStyles = (
  rightComponentPadding: number | `${number}%`,
  headerInfoPadding: number | `${number}%`
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
      paddingHorizontal: 10,
    },
    simpleTitleText: {
      fontSize: 20,
      lineHeight: 24,
      textAlign: 'center',
      flex: 1,
    },
    simpleBackButton: {
      width: 5,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 10,
    },
    rightComponentContainer: {
      alignItems: 'flex-end',
    },
    placeholder: {
      width: 5,
    },
    addWalletText: {
      letterSpacing: 0.18,
      fontSize: 20,
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
      paddingTop: windowHeight > 680 ? 15 : 7,
    },
    backButton: {
      height: 20,
      width: 20,
      justifyContent: 'center',
      paddingHorizontal: 10,
    },
    learnMoreContainer: {
      height: wp(26),
      width: wp(83),
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
      paddingTop: hp(25),
      width: windowWidth * 0.9,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
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
      gap: 5,
    },
    smallWidth: {
      width: windowWidth * 0.5,
      flexShrink: 1,
    },
    rightComponent: {
      paddingRight: rightComponentPadding,
    },
    availableBalance: {
      marginLeft: wp(61),
    },
  });

export default KeeperHeader;
