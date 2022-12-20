import { Box, Text } from 'native-base';

import BackButton from 'src/assets/images/svgs/back.svg';
import React from 'react';
import { ScaledSheet } from 'react-native-size-matters';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { windowHeight } from 'src/common/data/responsiveness/responsive';

type Props = {
  title?: string;
  subtitle?: string;
  onPressHandler?: () => void;
  enableBack?: boolean;
  headerTitleColor?: string;
  paddingLeft?: number;
  paddingTop?: number;
  learnMore?: boolean;
  learnMorePressed?: () => void;
  titleFontSize?: number;
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
  learnMorePressed = () => {},
  titleFontSize = 16,
}: Props) {
  const navigation = useNavigation();
  return (
    <Box style={styles.container}>
      {enableBack && (
        <Box style={styles.backContainer}>
          <TouchableOpacity onPress={onPressHandler || navigation.goBack} style={styles.backButton}>
            <BackButton />
          </TouchableOpacity>
          {learnMore && (
            <TouchableOpacity onPress={learnMorePressed}>
              <Box
                borderColor="light.brownborder"
                backgroundColor="light.yellow2"
                style={styles.learnMoreContainer}
              >
                <Text color="light.brownborder" fontWeight={200} style={styles.learnMoreText}>
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
              style={styles.addWalletText}
              color={headerTitleColor}
              fontSize={titleFontSize}
            >
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={styles.addWalletDescription} color="light.lightBlack">
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
    paddingHorizontal: '20@s',
  },
  addWalletDescription: {
    fontSize: 12,
    lineHeight: '17@s',
    letterSpacing: '0.5@s',
    paddingHorizontal: '20@s',
    fontWeight: '200',
  },
  backContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '5@s',
    paddingVertical: windowHeight > 680 ? '15@s' : '7@s',
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
