import { StyleSheet } from 'react-native';
import React from 'react';
import { Box, useColorMode } from 'native-base';
import { wp } from 'src/constants/responsive';
import Text from './KeeperText';

export function Instruction({ text }: { text: string }) {
  const { colorMode } = useColorMode();
  return (
    <Box style={styles.bulletContainer}>
      <Box style={styles.bullet} backgroundColor={`${colorMode}.black`}></Box>
      <Text color={`${colorMode}.secondaryText`} style={styles.infoText}>
        {text}
      </Text>
    </Box>
  );
}

export default Instruction;

const styles = StyleSheet.create({
  bulletContainer: {
    paddingTop: 4,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 12,
  },
  bullet: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 7,
    height: 7,
    borderRadius: 10 / 2,
    marginTop: 11,
  },
  infoText: {
    letterSpacing: 0.65,
    padding: 3,
    fontSize: 13,
    width: wp(285),
  },
});
