import { Dimensions, TouchableOpacity } from 'react-native';
import { Text, View } from 'native-base';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

import BackButton from 'src/assets/images/svgs/back.svg';
import { RFValue } from 'react-native-responsive-fontsize';
import React from 'react';
import { ScaledSheet } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const HeaderTitle = ({ title = '', subtitle = '', color = 'light.lightYellow' }) => {
  const navigation = useNavigation();
  return (
    <View style={styles.container} background={color}>
      <TouchableOpacity onPress={navigation.goBack} style={styles.back}>
        <BackButton />
      </TouchableOpacity>
      <View style={{ marginTop: hp(0.5), marginLeft: wp(7) }}>
        <Text
          numberOfLines={1}
          style={styles.addWalletText}
          color={'light.headerText'}
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
  container: {
    paddingVertical: '40@s',
    paddingHorizontal: '20@s',
    flexDirection: 'row',
    alignItems: 'center',
    width,
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
  },
  back: {
    padding: 20,
  },
});
export default HeaderTitle;
