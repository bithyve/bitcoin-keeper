import React from 'react';
import { Box, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from './KeeperText';

type CardPillProps = {
  heading: string;
  backgroundColor?: string;
};

function CardPill({ heading, backgroundColor }: CardPillProps) {
  const { colorMode } = useColorMode();
  return (
    <Box
      backgroundColor={backgroundColor ? backgroundColor : `${colorMode}.LightKhaki`}
      style={styles.pillContainer}
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
