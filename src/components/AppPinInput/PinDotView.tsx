import React from 'react';
import { Box, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Dot from '../Dot';
import { hp } from 'src/constants/responsive';

export interface PinDotViewProps {
  passCode?: string;
  dotColor?: string;
  dotSize?: number;
  borderColor?: string;
  backgroundColor?: string;
  hideDelay?: number;
}

const PinDotView = ({
  passCode,
  dotColor,
  dotSize = hp(17),
  borderColor,
  backgroundColor,
}: PinDotViewProps) => {
  const { colorMode } = useColorMode();
  return (
    <Box
      style={{
        ...styles.dotContainer,
        backgroundColor: backgroundColor,
      }}
    >
      {[0, 1, 2, 3].map((index) => (
        <Dot
          key={index}
          filled={passCode?.length > index}
          dotSize={dotSize}
          borderColor={`${colorMode}.appStatusTextColor` || borderColor}
          dotColor={`${colorMode}.headerWhite` || dotColor}
        />
      ))}
    </Box>
  );
};

const styles = StyleSheet.create({
  dotContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 15,
  },
});

export default PinDotView;
