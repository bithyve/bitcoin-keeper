import { StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import Text from './KeeperText';
import { Box, useColorMode } from 'native-base';

const ActionChip = ({ Icon, text, onPress }) => {
  const { colorMode } = useColorMode();
  return (
    <TouchableOpacity activeOpacity={0.6} onPress={onPress} testID={`btn${text}`}>
      <Box
        borderColor={`${colorMode}.BrownNeedHelp`}
        backgroundColor={`${colorMode}.BrownNeedHelp`}
        style={styles.container}
      >
        {Icon}
        <Text color={`${colorMode}.buttonText`} medium style={styles.text}>
          {text}
        </Text>
      </Box>
    </TouchableOpacity>
  );
};

export default ActionChip;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 3,
    borderWidth: 0.5,
    borderRadius: 5,
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 3,
  },
  text: {
    fontSize: 12,
    letterSpacing: 0.24,
    alignSelf: 'center',
  },
});
