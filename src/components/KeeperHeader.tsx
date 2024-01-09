import { Box, useColorMode } from 'native-base';
import BackBlackButton from 'src/assets/images/back.svg';
import BackWhiteButton from 'src/assets/images/back_white.svg';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { windowHeight, windowWidth } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';

type Props = {
  title?: string;
  subtitle?: string;
  onPressHandler?: () => void;
  enableBack?: boolean;
  learnMore?: boolean;
  learnMorePressed?: () => void;
  learnBackgroundColor?: string;
  learnTextColor?: string;
  rightComponent?: Element;
  contrastScreen?: boolean;
  marginLeft?: boolean;
};
function KeeperHeader({
  title = '',
  subtitle = '',
  onPressHandler,
  enableBack = true,
  learnMore = false,
  learnMorePressed = () => {},
  learnBackgroundColor = 'light.brownColor',
  learnTextColor = 'light.learMoreTextcolor',
  rightComponent = null,
  contrastScreen = false,
  marginLeft = true,
}: Props) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  return (
    <Box style={styles.container}>
      {enableBack && (
        <Box style={[styles.backContainer]}>
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
                  Learn More
                </Text>
              </Box>
            </TouchableOpacity>
          )}
        </Box>
      )}
      <Box style={styles.headerContainer}>
        <Box style={{ paddingLeft: marginLeft ? '10%' : 0 }}>
          {title && (
            <Text
              numberOfLines={1}
              style={[styles.addWalletText, { fontSize: 16 }]}
              color={`${colorMode}.headerText`}
              testID={`text_header_title`}
            >
              {title}
            </Text>
          )}
          {subtitle && (
            <Text
              style={[styles.addWalletDescription]}
              color={`${colorMode}.black`}
              testID={`text_header_subtitle`}
            >
              {subtitle}
            </Text>
          )}
        </Box>
        <Box>{rightComponent}</Box>
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
    letterSpacing: 0.6,
    alignSelf: 'center',
  },
  headerContainer: {
    width: windowWidth * 0.85,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
export default KeeperHeader;
