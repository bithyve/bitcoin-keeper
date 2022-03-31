import React from 'react';
import { View, Text } from 'native-base';
import { TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

const DevicesComponent = ({ title, onPress, subtitle, Icon }) => {

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <TouchableOpacity onPress={onPress}>
          <Icon />
        </TouchableOpacity>
      </View>
      <Text
        style={styles.deviceName}
        color={'light.lightBlack'}
        fontFamily={'body'}
        fontWeight={'100'}
        numberOfLines={2}
      >
        {title}
      </Text>
    </View>
  );
};

const styles = ScaledSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: wp(5)
  },
  deviceName: {
    fontSize: RFValue(10),
    lineHeight: '13@s',
    letterSpacing: '0.5@s',
    width: wp(15),
    textAlign: 'center'
  },
  deviceBg: {
    width: wp(19),
    height: hp(7),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(0.7)
  },
  iconWrapper: {
    marginBottom: hp(0.5)
  }
});
export default DevicesComponent;
