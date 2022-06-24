import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as SecureStore from '../../storage/secure-store';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    setTimeout(async () => {
      const hasCreds = await SecureStore.hasPin();
      if (hasCreds) {
        navigation.replace('Login', { relogin: false });
      } else {
        navigation.replace('CreatePin');
      }
    }, 500);
  }, []);

  return (
    <View style={styles.container}>
      <Text>Keeper</Text>
    </View>
  );
};

export default SplashScreen;
