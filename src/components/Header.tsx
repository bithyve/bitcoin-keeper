import { Dimensions, StyleSheet } from 'react-native';
import React from 'react';
import { HStack } from 'native-base';
import GoBack from './GoBack';
const { height } = Dimensions.get('window');

const Header = () => {
  return (
    <HStack justifyContent="flex-start" style={styles.container}>
      <GoBack />
    </HStack>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    paddingTop: height / 10,
    padding: '13%',
  },
});
