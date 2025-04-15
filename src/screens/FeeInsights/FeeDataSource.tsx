import { StyleSheet } from 'react-native';
import React from 'react';
import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';

const FeeDataSource = () => {
  const { colorMode } = useColorMode();
  return (
    <Box style={styles.container}>
      <Text style={styles.label} color={`${colorMode}.inActiveMsg`}>
        Data Source: mempool.space | coingecko.com
      </Text>
    </Box>
  );
};

export default FeeDataSource;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 5,
  },
  label: {
    fontSize: 10,
    letterSpacing: 1,
    textAlign: 'center',
  },
});
