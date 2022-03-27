import { StyleSheet, Text, View, Alert, Button, TextInput, Keyboard } from 'react-native';
import React, { useEffect, useState } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthCard from 'src/screens/LoginScreen/components/AuthCard/index';
import LogoContainer from 'src/screens/LoginScreen/components/LogoContainer/index';
import { authStatus } from './constants';
import AppNumPad from 'src/components/AppNumPad';
import AppPinInput from 'src/components/AppPinInput';

const userPin = '959027';
const LoginScreen = ({ navigation }) => {
  const [pin, setPin] = useState('');
  const [biommetricStatus, setbiommetricStatus] = useState(authStatus.IN_PROGRESS);
  const [passwordStatus, setPasswordStatus] = useState(authStatus.QUEUED);
  const [numPadDisable, setNumPadDisable] = useState(false);

  const bioMetricAuthentication = async () => {
    try {
      const results = await LocalAuthentication.authenticateAsync();
      console.log(results);
      if (results.success) {
        setbiommetricStatus(authStatus.APPROVED);
        setPasswordStatus(authStatus.IN_PROGRESS);
      }
      // if (results.success) {
      //   setResult(AuthResults.SUCCESS);
      // } else if (results.error === 'unknown') {
      //   setResult(AuthResults.DISABLED);
      // } else if (
      //   results.error === 'user_cancel' ||
      //   results.error === 'system_cancel' ||
      //   results.error === 'app_cancel'
      // ) {
      //   setResult(AuthResults.CANCELLED);
      // }
    } catch (error) {}
  };

  const checkPin = () => {
    if (pin === userPin) {
      setPasswordStatus(authStatus.APPROVED);
      navigation.navigate('Home');
    } else setPasswordStatus(authStatus.IN_PROGRESS);
  };

  useEffect(() => {
    if (biommetricStatus !== authStatus.APPROVED) bioMetricAuthentication();
  }, []);

  useEffect(() => {
    if (pin.length === 6) {
      checkPin();
      setNumPadDisable(true);
    } else if (pin.length < 6) {
      setNumPadDisable(false);
      setPasswordStatus(authStatus.IN_PROGRESS);
    }
  }, [pin]);

  return (
    <SafeAreaView style={styles.screen}>
      <LogoContainer />
      <View style={styles.content}>
        <View style={styles.authContatiner}>
          <AuthCard type={'Face Id'} status={biommetricStatus} />
          <AuthCard type={'Password'} status={passwordStatus} />
        </View>
        <View style={styles.pinContainer}>
          <AppPinInput value={pin} maxLength={6} />
          <AppNumPad clear setValue={setPin} disable={numPadDisable} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#2F2F2F', height: '100%' },
  content: { justifyContent: 'space-between', flex: 1 },
  authContatiner: { flexDirection: 'column' },
  pinContainer: { margin: 30 },
});

export default LoginScreen;
