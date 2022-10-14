import { Box, Text } from 'native-base';

import BackButton from 'src/assets/images/svgs/back.svg';
import { RFValue } from 'react-native-responsive-fontsize';
import React from 'react';
import { ScaledSheet } from 'react-native-size-matters';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CurrencyTypeSwitch from './Switch/CurrencyTypeSwitch';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

type Props = {
  title?: string;
  subtitle?: string;
  onPressHandler?: () => void;
  enableBack?: boolean;
  headerTitleColor?: string;
  paddingLeft?: number;
  paddingTop?: number;
  showToggler?: boolean;
  learnMore?: boolean;
  learnMorePressed?: () => void;
};
const HeaderTitle = ({
  title = '',
  subtitle = '',
  onPressHandler,
  enableBack = true,
  headerTitleColor = 'light.headerText',
  paddingLeft = 0,
  paddingTop = 0,
  showToggler = false,
  learnMore = false,
  learnMorePressed = () => { }
}: Props) => {
  const navigation = useNavigation();
  return (
    <Box style={styles.container}>
      {enableBack && (
        <Box
          style={styles.back}
        >
          <TouchableOpacity
            onPress={onPressHandler ? onPressHandler : navigation.goBack}
          >
            <BackButton />
          </TouchableOpacity>
          {learnMore &&
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
            </TouchableOpacity>}
        </Box>
      )}
      {title || subtitle &&
        <Box flexDirection={'row'} alignItems={'center'} justifyContent={'space-between'}>
          <Box paddingLeft={paddingLeft} paddingTop={paddingTop}>
            {title && (
              <Text
                numberOfLines={1}
                style={styles.addWalletText}
                color={headerTitleColor}
                fontFamily={'body'}
                fontWeight={'200'}
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
          {showToggler && <Box paddingTop={paddingTop}>
            <CurrencyTypeSwitch />
          </Box>}
        </Box>
      }
    </Box>
  );
};

const styles = ScaledSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  addWalletText: {
    fontSize: RFValue(16),
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
