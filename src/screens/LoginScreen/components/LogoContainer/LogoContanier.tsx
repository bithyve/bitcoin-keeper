import { StyleSheet, Text, View } from 'react-native';
import React, { useContext } from 'react';
import LockIcon from 'src/assets/icons/lock.svg';
import { LocalizationContext } from 'src/common/content/LocContext';

const LogoContainer = () => {

  const { translations } = useContext( LocalizationContext )
  const login = translations[ 'login' ]

  return (
    <View style={styles.logoContainer}>
      <LockIcon width={100} height={30} />
      <Text style={styles.loginText}>{login.login}</Text>
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
