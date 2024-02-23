import { StyleSheet } from 'react-native';
import React from 'react';
import { Box, useColorMode } from 'native-base';
import { wp } from 'src/constants/responsive';
import Text from './KeeperText';

export function Instruction({ text }: { text: string }) {
  const { colorMode } = useColorMode();
  return (
    <Box style={styles.bulletContainer}>
      <Box backgroundColor={`${colorMode}.greenText`} />
      <Text bold fontSize={24}>
        •
      </Text>
      <Text color={`${colorMode}.SlateGrey`} style={styles.infoText}>
        {text}
      </Text>
    </Box>
  );
}

export default Instruction;

const styles = StyleSheet.create({
  bulletContainer: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  infoText: {
    letterSpacing: 0.65,
    padding: 3,
    fontSize: 13,
    width: wp(285),
  },
});
