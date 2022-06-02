import React from 'react';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { View, Text } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import { TouchableOpacity } from 'react-native';

import BackButton from 'src/assets/images/svgs/back.svg';

const HeaderTitle = ({ title = '', subtitle = '', onPressHandler, color = 'light.lightYellow' }) => {
  return (
    <View background={color}>
      <TouchableOpacity onPress={onPressHandler} style={{ marginLeft: wp(2.5) }}>
        <BackButton />
      </TouchableOpacity>
      <View style={{ marginTop: hp(1), marginLeft: wp(7) }}>
        <Text
          numberOfLines={1}
          style={styles.addWalletText}
          color={'light.lightBlack'}
          fontFamily={'body'}
          fontWeight={'200'}
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
      </View>
    </View>
  );
};

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    padding: '20@s',
  },
  addWalletText: {
    fontSize: RFValue(22),
    lineHeight: '23@s',
    letterSpacing: '0.7@s',
    marginTop: hp(5),
  },
  addWalletDescription: {
    fontSize: RFValue(12),
    lineHeight: '17@s',
    letterSpacing: '0.5@s',
    width: wp('60%'),
  },
});
export default HeaderTitle;
