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
};

function CardPill({ heading, backgroundColor, headingColor, cardStyle, height }: CardPillProps) {
  const { colorMode } = useColorMode();
  return (
    <Box
      backgroundColor={backgroundColor || `${colorMode}.walletTypePillBack`}
      style={[styles.pillContainer, cardStyle && cardStyle]}
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
    paddingHorizontal: wp(10),
    height: hp(21),
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 10,
    lineHeight: 18,
  },
});

export default CardPill;
