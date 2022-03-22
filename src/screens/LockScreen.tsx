import { StyleSheet, Text, View, Alert } from 'react-native';
import React, { useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

const LockScreen = () => {
  const [isBiometricSupported, setIsBiometricSupported] = React.useState(false);

  useEffect(() => {
    (async () => {
      try {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        setIsBiometricSupported(compatible);
      } catch (err) {
        console.log('error', err);
      }
    })();
  });
  return (
    <View style={styles.screen}>
      <Text>LockScreen</Text>
      <Text>
        {' '}
        {isBiometricSupported ? 'Your device is compatible with Biometrics' : 'Fuck you'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default LockScreen;