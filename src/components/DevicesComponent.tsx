import React from 'react';
import { View, Text } from 'native-base';
import { ImageBackground, Touchable, TouchableOpacity} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

const DevicesComponent = ({ item }) => {
  const Icon = item?.item?.Childern
  
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
       <TouchableOpacity>
      <Icon/>
      </TouchableOpacity>
      </View>
      <Text
        style={styles.deviceName}
        color={'light.lightBlack'}
        fontFamily={'body'}
        fontWeight={'100'}
      >
        {item?.item?.title}
      </Text>
      <Text
        style={styles.deviceName}
        color={'light.lightBlack'}
        fontFamily={'body'}
        fontWeight={'100'}
      >
       {item?.item?.subtitle}
      </Text>
    </View>
  );
};

const styles = ScaledSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    marginRight:wp(5)
  },
  deviceName: {
    fontSize: RFValue(10),
    lineHeight: '13@s',
    letterSpacing: '0.5@s',
  },
  deviceBg: {
    width: wp(19),
    height: hp(7),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(0.7)
  },
  iconWrapper:{
    marginBottom:hp(0.5)
  }
});
export default DevicesComponent;
