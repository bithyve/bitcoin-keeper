import { StyleSheet, View } from 'react-native';
import React, { useContext } from 'react';
import LockIcon from 'src/assets/images/lock.svg';
import { LocalizationContext } from 'src/common/content/LocContext';
import Text from 'src/components/KeeperText';

function LogoContainer() {
  const { translations } = useContext(LocalizationContext);
  const { login } = translations;

  return (
    <View style={styles.logoContainer}>
      <LockIcon width={100} height={30} />
      <Text style={styles.loginText}>{login.login}</Text>
    </View>
  );
}

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
