import React from 'react';
import { Box, useColorMode } from 'native-base';
import { StyleSheet, ViewStyle } from 'react-native';
import Text from './KeeperText';

type CardPillProps = {
  heading: string;
  cardStyles?: ViewStyle;
};

function CardPill({ heading, cardStyles }: CardPillProps) {
  const { colorMode } = useColorMode();
  return (
    <Box
      backgroundColor={`${colorMode}.LightKhaki`}
      style={[styles.pillContainer, cardStyles && cardStyles]}
    >
      <Text bold style={styles.heading} color={`${colorMode}.SlateGrey`} numberOfLines={1}>
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
    lineHeight: 17,
  },
});

export default CardPill;
