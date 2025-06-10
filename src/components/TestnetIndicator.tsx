import React, { useContext } from 'react';
import { Box, useColorMode } from 'native-base';

import Text from 'src/components/KeeperText';
import { StyleSheet } from 'react-native';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function TestnetIndicator() {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  return (
    <Box backgroundColor={`${colorMode}.white`} style={styles.container}>
      <Text color={`${colorMode}.primaryGreen`} bold style={styles.text}>
        {common.TESTNET}
      </Text>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 99,
    paddingHorizontal: 8,
    height: 20,
  },
  text: {
    fontSize: 12,
    letterSpacing: 0.9,
  },
});

export default TestnetIndicator;
