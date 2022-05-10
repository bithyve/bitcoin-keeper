import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import LockIcon from 'assets/images/lock.svg';

const LogoContainer = () => {
  return (
    <View style={styles.logoContainer}>
      <LockIcon width={100} height={30} />
      <Text style={styles.loginText}>Login</Text>
    </View>
  );
};

export default LogoContainer;

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    marginTop: 10,
    fontSize: 25,
    color: '#FAC48B',
  },
});
