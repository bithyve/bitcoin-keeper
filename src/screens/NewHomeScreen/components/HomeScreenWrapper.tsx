import { StyleSheet } from 'react-native';
import React from 'react';
import { Box } from 'native-base';
import HeaderDetails from './HeaderDetails';

function HomeScreenWrapper({ children }) {
  return (
    <Box style={styles.container}>
      <HeaderDetails />
      <Box style={styles.container}>{children}</Box>
    </Box>
  );
}

export default HomeScreenWrapper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
  },
});
