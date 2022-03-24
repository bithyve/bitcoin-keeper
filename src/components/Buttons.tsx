import React from 'react';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { View, Text } from 'native-base'
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import { TouchableOpacity } from 'react-native';

import { Shadow } from 'react-native-shadow-2';
import LinearGradient from 'react-native-linear-gradient';

const Buttons = () => {

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
      <TouchableOpacity style={styles.cancelBtn}>
        <Text
          style={{ fontSize: RFValue(14), letterSpacing: 0.84, fontWeight: '700' }}
          color={'light.greenText'}
          fontFamily={'body'}
          fontWeight={'300'}>
          Cancel
        </Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Shadow distance={10} startColor={'#073E3926'} offset={[3, 4]}>
          <LinearGradient style={styles.createBtn} start={{ x: 0, y: 0.75 }} end={{ x: 1, y: 0.25 }} colors={['#00836A', '#073E39']}>
            <Text style={{ fontSize: RFValue(14), letterSpacing: 0.84, fontWeight: '700' }}
              color={'light.white'}
              fontFamily={'body'}
              fontWeight={'300'}>
              Create
            </Text>
          </LinearGradient>
        </Shadow>
      </TouchableOpacity>
    </View>
  );
};

const styles = ScaledSheet.create({
  createBtn: {
    paddingHorizontal: wp(12),
    paddingVertical: hp(2.3),
    borderRadius: '10@s'
  },
  cancelBtn: {
    paddingHorizontal: wp(8),
    paddingVertical: hp(2.3),
    borderRadius: '10@s'
  },
});
export default Buttons;