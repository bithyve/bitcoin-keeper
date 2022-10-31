import { Box, Text } from 'native-base';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

import BackButton from 'src/assets/images/svgs/back.svg';
import { RFValue } from 'react-native-responsive-fontsize';
import React from 'react';
import { ScaledSheet } from 'react-native-size-matters';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

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
const HeaderTitle = ({
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
}: Props) => {
  const navigation = useNavigation();
  return (
    <Box style={styles.container}>
      {enableBack && (
        <Box style={styles.back}>
          <TouchableOpacity onPress={onPressHandler ? onPressHandler : navigation.goBack}>
            <BackButton />
          </TouchableOpacity>
          {learnMore && (
            <TouchableOpacity onPress={learnMorePressed}>
              <Box
                height={hp(20)}
                width={wp(70)}
                borderColor={'light.brownborder'}
                borderWidth={0.5}
                borderRadius={5}
                backgroundColor={'light.yellow2'}
                justifyContent={'center'}
                alignItems={'center'}
              >
                <Text
                  color={'light.brownborder'}
                  fontWeight={200}
                  letterSpacing={0.6}
                  fontSize={12}
                >
                  Learn More
                </Text>
              </Box>
            </TouchableOpacity>
          )}
        </Box>
      )}
      <Box flexDirection={'row'} alignItems={'center'} justifyContent={'space-between'}>
        <Box paddingLeft={paddingLeft} paddingTop={paddingTop}>
          {title && (
            <Text
              numberOfLines={1}
              style={styles.addWalletText}
              color={headerTitleColor}
              fontFamily={'body'}
              fontWeight={'200'}
              fontSize={RFValue(titleFontSize)}
            >
              {title}
            </Text>
          )}
          {subtitle && (
            <Text
              style={styles.addWalletDescription}
              color={'light.lightBlack'}
              fontFamily={'body'}
              fontWeight={'100'}
            >
              {subtitle}
            </Text>
          )}
        </Box>
        {/* {HeaderRight && <Box paddingTop={paddingTop}>
          <HeaderRight />
        </Box>} */}
      </Box>
    </Box>
  );
};

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
    fontSize: RFValue(12),
    lineHeight: '17@s',
    letterSpacing: '0.5@s',
    paddingHorizontal: '20@s',
  },
  back: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingHorizontal: '5@s',
    paddingVertical: '15@s',
  },
});
export default HeaderTitle;
