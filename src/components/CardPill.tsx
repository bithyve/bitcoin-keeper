import React from 'react';
import { Box, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from './KeeperText';
import { wp } from 'src/constants/responsive';

type CardPillProps = {
  heading: string;
  backgroundColor?: string;
  headingColor?: string;
  cardStyle?: any;
};

function CardPill({ heading, backgroundColor, headingColor, cardStyle }: CardPillProps) {
  const { colorMode } = useColorMode();
  return (
    <Box
      backgroundColor={backgroundColor || `${colorMode}.walletTypePillBack`}
      style={[styles.pillContainer, cardStyle && cardStyle]}
    >
      <Text
        bold
        style={styles.heading}
        color={headingColor || `${colorMode}.black`}
        numberOfLines={1}
      >
        {heading}
      </Text>
    </Box>
  );
}

const styles = StyleSheet.create({
  pillContainer: {
    paddingHorizontal: wp(7),
    height: 17,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 8,
    lineHeight: 18,
    letterSpacing: 0.32,
    opacity: 0.75,
  },
});

export default CardPill;
