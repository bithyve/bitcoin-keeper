import { StyleSheet } from 'react-native';
import React from 'react';
import { Box, useColorMode } from 'native-base';
import { hp, wp } from 'src/constants/responsive';
import Text from './KeeperText';

export function Instruction({ text }: { text: string }) {
  const { colorMode } = useColorMode();
  return (
    <Box style={styles.bulletContainer}>
      <Box
        backgroundColor={`${colorMode}.greenText`}
        //  style={styles.bulletPoint}
      />
      <Text color={`${colorMode}.greenText`} style={styles.infoText}>
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
  },
  bulletPoint: {
    marginRight: wp(5),
    height: hp(5),
    width: hp(5),
    borderRadius: 10,
    top: 12,
  },
  infoText: {
    letterSpacing: 0.65,
    padding: 3,
    fontSize: 13,
    width: wp(285),
  },
});
