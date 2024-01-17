import { StyleSheet } from 'react-native';
import React from 'react';
import { Box, StatusBar, useColorMode } from 'native-base';
import HeaderDetails from './HeaderDetails';

function HomeScreenWrapper({ children }) {
  const { colorMode } = useColorMode();
  return (
    <Box style={styles.container}>
      <StatusBar barStyle={colorMode === 'light' ? 'light-content' : 'dark-content'} />
      <HeaderDetails />
      <Box style={styles.container}>{children}</Box>
    </Box>
  );
}

export default HomeScreenWrapper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
