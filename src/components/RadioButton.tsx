/* eslint-disable react/require-default-props */
/* eslint-disable react/function-component-definition */
import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { Box, useColorMode } from 'native-base';

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
  const containerStyle = useMemo(
    () => ({
      ...styles.rootContainer,
      borderColor,
      borderRadius: size / 2,
      height: size,
      width: size,
    }),
    [
      // borderColor,
      size,
    ]
  );
  const { colorMode } = useColorMode();
  const innerCircleStyle = useMemo(
    () => ({
      // backgroundColor: color,
      borderRadius: size / 2,
      height: size - 5,
      width: size - 5,
    }),
    [
      // color,
      size,
    ]
  );

  return (
    <TouchableOpacity
      style={containerStyle}
      activeOpacity={1}
      disabled={ignoresTouch}
      onPress={onpress}
    >
      <Box style={{ ...styles.createBtn }} backgroundColor={`${colorMode}.pantoneGreen`}>
        {isChecked && <View style={innerCircleStyle} />}
      </Box>
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
