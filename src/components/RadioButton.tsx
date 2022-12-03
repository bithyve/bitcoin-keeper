import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

export type Props = {
  isChecked: boolean;
  size?: number;
  // color?: string;
  borderColor?: string;
  ignoresTouch?: boolean;
  onpress?: () => void;
};

const RadioButton: React.FC<Props> = ({
  isChecked = false,
  size = 20,
  // color = '#00836A',
  borderColor = '#E3E3E3',
  ignoresTouch = false,
  onpress = () => {},
}: Props) => {
  const containerStyle = useMemo(() => ({
      ...styles.rootContainer,
      borderColor,
      borderRadius: size / 2,
      height: size,
      width: size,
    }), [
    // borderColor,
    size,
  ]);

  const innerCircleStyle = useMemo(() => ({
      // backgroundColor: color,
      borderRadius: size / 2,
      height: size - 5,
      width: size - 5,
    }), [
    // color,
    size,
  ]);

  return (
    <TouchableOpacity
      style={containerStyle}
      activeOpacity={1}
      disabled={ignoresTouch}
      onPress={onpress}
    >
      <LinearGradient
        style={{ ...styles.createBtn }}
        start={{ x: 0.8, y: 0.1 }}
        end={{ x: 0.35, y: 0.9 }}
        colors={['#00836A', '#073E39']}
      >
        {isChecked && <View style={innerCircleStyle} />}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtn: {
    paddingHorizontal: wp(0.03),
    paddingVertical: hp(0.01),
    borderRadius: 10,
  },
});

export default RadioButton;
