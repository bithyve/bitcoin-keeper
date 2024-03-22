import React from 'react';
import { Box, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from './KeeperText';

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
      backgroundColor={backgroundColor || `${colorMode}.vaultCardText`}
      style={[styles.pillContainer, cardStyle && cardStyle]}
    >
      <Text
        bold
        style={styles.heading}
        color={headingColor || `${colorMode}.secondaryText`}
        numberOfLines={1}
      >
        {heading}
      </Text>
    </Box>
  );
}

const styles = StyleSheet.create({
  pillContainer: {
    paddingHorizontal: '6%',
    height: 17,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 8,
    lineHeight: 18,
    letterSpacing: 0.32,
  },
});

export default CardPill;
