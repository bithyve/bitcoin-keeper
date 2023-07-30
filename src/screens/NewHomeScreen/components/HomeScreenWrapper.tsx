import { StyleSheet, StatusBar } from 'react-native';
import React from 'react';
import { Box, useColorMode } from 'native-base';
import HeaderDetails from './HeaderDetails';

function HomeScreenWrapper({ children }) {
  const { colorMode } = useColorMode();
  return (
    <Box style={styles.container}>
      <StatusBar barStyle={colorMode === 'light' ? "dark-content" : "light-content"} />
      <HeaderDetails />
      <Box style={styles.container}>{children}</Box>
    </Box>
  );
}

export default HomeScreenWrapper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
});
