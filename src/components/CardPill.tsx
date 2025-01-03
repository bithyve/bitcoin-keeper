import React from 'react';
import { Box, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from './KeeperText';
import { hp, wp } from 'src/constants/responsive';

type CardPillProps = {
  heading: string;
  backgroundColor?: string;
  headingColor?: string;
  cardStyle?: any;
  height?: number;
  borderRadius?: number;
  paddingHorizontal?: number;
};

function CardPill({
  heading,
  backgroundColor,
  headingColor,
  cardStyle,
  height,
  borderRadius = 20,
  paddingHorizontal = wp(10),
}: CardPillProps) {
  const { colorMode } = useColorMode();
  return (
    <Box
      backgroundColor={backgroundColor || `${colorMode}.walletTypePillBack`}
      style={[styles.pillContainer, cardStyle && cardStyle, { height: height || 21 }]}
      borderRadius={borderRadius}
      paddingX={paddingHorizontal}
    >
      <Text
        bold
        style={styles.heading}
        color={headingColor || `${colorMode}.pillText`}
        numberOfLines={1}
      >
        {heading}
      </Text>
    </Box>
  );
}

const styles = StyleSheet.create({
  pillContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 10,
    lineHeight: 18,
  },
});

export default CardPill;
