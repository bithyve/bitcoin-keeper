import { ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, View } from 'native-base';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

import LinearGradient from 'react-native-linear-gradient';
import { RFValue } from 'react-native-responsive-fontsize';
import React from 'react';
import { ScaledSheet } from 'react-native-size-matters';
import { Shadow } from 'react-native-shadow-2';

const Buttons = ({
  primaryText = '',
  secondaryText = '',
  primaryCallback = () => { },
  secondaryCallback = () => { },
  primaryDisable = false,
  secondaryDisable = false,
  primaryLoading = false,
  paddingHorizontal = wp(40)
}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 20,
      }}
    >
      {secondaryText != '' && (
        <TouchableOpacity
          style={[styles.cancelBtn, { opacity: secondaryDisable ? 0.5 : 1 }]}
          onPress={secondaryCallback}
          disabled={secondaryDisable}
          activeOpacity={0.5}
        >
          <Text
            numberOfLines={1}
            style={{
              fontSize: RFValue(14),
              letterSpacing: 0.84,
              fontWeight: '700',
            }}
            color={'light.greenText'}
            fontFamily={'body'}
            fontWeight={'300'}
          >
            {secondaryText}
          </Text>
        </TouchableOpacity>
      )}
      {primaryText ? (
        primaryLoading ? (
          <ActivityIndicator style={styles.createBtn} />
        ) : (
          <TouchableOpacity onPress={primaryCallback} disabled={primaryDisable}>
            <Shadow distance={10} startColor={'#073E3926'} offset={[3, 4]}>
              <LinearGradient
                style={[styles.createBtn, { opacity: primaryDisable ? 0.5 : 1, paddingHorizontal: paddingHorizontal }]}
                start={{ x: 0, y: 0.75 }}
                end={{ x: 1, y: 0.25 }}
                colors={['#00836A', '#073E39']}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: RFValue(14),
                    letterSpacing: 0.84,
                    fontWeight: '700',
                  }}
                  color={'light.white'}
                  fontFamily={'body'}
                  fontWeight={'300'}
                >
                  {primaryText}
                </Text>
              </LinearGradient>
            </Shadow>
          </TouchableOpacity>
        )
      ) : null}
    </View>
  );
};

const styles = ScaledSheet.create({
  createBtn: {
    paddingVertical: hp(15),
    borderRadius: '10@s',
  },
  cancelBtn: {
    marginRight: wp(20),
    borderRadius: '10@s',
  },
});
export default Buttons;
