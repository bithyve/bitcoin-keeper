import { Box, Text } from 'native-base';

import BackButton from 'src/assets/images/svgs/back.svg';
import { RFValue } from 'react-native-responsive-fontsize';
import React from 'react';
import { ScaledSheet } from 'react-native-size-matters';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

type Props = {
  title?: string;
  subtitle?: string;
  onPressHandler?: () => void;
  enableBack?: boolean;
  headerTitleColor?: string;
  fontSize?: number
};
const Header = ({
  title = '',
  subtitle = '',
  onPressHandler,
  enableBack = true,
  headerTitleColor = 'light.headerText',
  fontSize = 16
}: Props) => {
  const navigation = useNavigation();
  return (
    <Box style={styles.container}>
      {enableBack && (
        <TouchableOpacity
          onPress={onPressHandler ? onPressHandler : navigation.goBack}
          style={styles.back}
        >
          <BackButton />
        </TouchableOpacity>
      )}
      {(title || subtitle) &&
        <Box marginLeft={5} marginTop={hp(30)}>
          {title && (
            <Text
              numberOfLines={1}
              style={styles.addWalletText}
              color={headerTitleColor}
              fontFamily={'body'}
              fontWeight={'200'}
              fontSize={RFValue(fontSize)}
              noOfLines={2}
            >
              {title}
            </Text>
          )}
          {subtitle && (
            <Text
              numberOfLines={2}
              style={styles.addWalletDescription}
              color={'light.lightBlack'}
              fontFamily={'body'}
              fontWeight={'100'}
            >
              {subtitle}
            </Text>
          )}
        </Box>}
    </Box>
  );
};

const styles = ScaledSheet.create({
  container: {
    backgroundColor: 'transparent',
    marginTop: hp(5)
  },
  addWalletText: {
    lineHeight: '23@s',
    letterSpacing: '0.8@s',
    // paddingHorizontal: '40@s',
  },
  addWalletDescription: {
    fontSize: RFValue(12),
    lineHeight: '17@s',
    letterSpacing: '0.5@s',
    // paddingHorizontal: '40@s',
  },
  back: {
    paddingHorizontal: wp(5),
    // marginBottom: hp(30)
  },
});
export default Header;
