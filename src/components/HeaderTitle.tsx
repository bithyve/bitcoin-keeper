import React from 'react';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { View, Box, Text } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import { TouchableOpacity } from 'react-native';

import BackButton from 'src/assets/images/svgs/back.svg';
import { windowHeight, windowWidth } from 'src/common/data/responsiveness/responsive';

const HeaderTitle = ({
  title = '',
  subtitle = '',
  onPressHandler,
  color = 'light.lightYellow',
  marginLeft = 0.025,
  enableBack = true,
  hearderMarginTop = 0.05,
  hearderMarginLeft = 0.07,
  headerColor = 'light.headerText'
}) => {
  return (
    <Box background={color}>
      {enableBack && <TouchableOpacity
        onPress={onPressHandler}
        style={{
          marginLeft: windowWidth * marginLeft
        }}
      >
        <BackButton />
      </TouchableOpacity>}
      <Box
        marginLeft={windowWidth * hearderMarginLeft}
      >
        <Text
          numberOfLines={1}
          style={styles.addWalletText}
          color={headerColor}
          fontFamily={'body'}
          fontWeight={'200'}
          marginTop={windowHeight * hearderMarginTop}
        >
          {title}
        </Text>
        <Text
          numberOfLines={1}
          style={styles.addWalletDescription}
          color={'light.lightBlack'}
          fontFamily={'body'}
          fontWeight={'100'}
        >
          {subtitle}
        </Text>
      </Box>
    </Box >
  );
};

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    padding: '20@s',
  },
  addWalletText: {
    fontSize: RFValue(16),
    lineHeight: '23@s',
    letterSpacing: '0.8@s',
  },
  addWalletDescription: {
    fontSize: RFValue(12),
    lineHeight: '17@s',
    letterSpacing: '0.5@s',
    width: wp('60%'),
  },
});
export default HeaderTitle;
