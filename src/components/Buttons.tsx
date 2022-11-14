import React from 'react';
import { ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, View, Box } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import { Shadow } from 'react-native-shadow-2';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

const Buttons = ({
  primaryText = '',
  secondaryText = '',
  primaryCallback = () => { },
  secondaryCallback = () => { },
  primaryDisable = false,
  secondaryDisable = false,
  primaryLoading = false,
  paddingHorizontal = wp(40),
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
              <Box
                style={[styles.createBtn, { opacity: primaryDisable ? 0.5 : 1, paddingHorizontal: paddingHorizontal }]}
                bg={{
                  linearGradient: {
                    colors: ['light.lgStart', 'light.lgEnd'],
                    start: [0, 0],
                    end: [1, 1]
                  }
                }}
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
              </Box>
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
