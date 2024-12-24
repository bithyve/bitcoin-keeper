import { Box, useColorMode } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';

interface DotProps {
  filled: boolean;
  dotSize: number;
  borderColor: string;
  dotColor: string;
}

const Dot = ({ filled, dotSize, borderColor, dotColor }: DotProps) => {
  const { colorMode } = useColorMode();
  return (
    <Box
      style={styles.dot}
      width={dotSize}
      height={dotSize}
      backgroundColor={filled ? dotColor : `${colorMode}.appStatusButtonBackground`}
      borderColor={borderColor}
    />
  );
};

const styles = StyleSheet.create({
  dot: {
    borderRadius: 50,
    borderWidth: 1,
  },
});

export default Dot;
