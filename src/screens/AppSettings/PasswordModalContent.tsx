import { Box, useColorMode } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Buttons from 'src/components/Buttons';
import Text from 'src/components/KeeperText';
import KeeperTextInput from 'src/components/KeeperTextInput';
import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import LoginMethod from 'src/models/enums/LoginMethod';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { credsAuth } from 'src/store/sagaActions/login';
import { credsAuthenticated } from 'src/store/reducers/login';

interface Props {
  close?: Function;
  onSuccess?: Function;
  oldPassword?: any;
}
const PasswordModalContent = ({ close, onSuccess, oldPassword }: Props) => {
  const { colorMode } = useColorMode();
  const dispatch = useAppDispatch();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [errMessage, setErrMessage] = useState('');

  console.log('passwordauth', password);

  const { isAuthenticated, authenticationFailed } = useAppSelector((state) => state.login);

  const attemptLogin = (passcode: string) => {
    dispatch(credsAuth(passcode, LoginMethod.PASSWORD, true));
  };

  useEffect(() => {
    if (isAuthenticated) {
      onSuccess(password);
      close();
      dispatch(credsAuthenticated(false));
    }
  }, [isAuthenticated]);
  useEffect(() => {
    if (authenticationFailed && password !== '') {
      setLoginError(true);
      setErrMessage('Incorrect password');
      dispatch(credsAuthenticated(false));
    } else {
      setLoginError(false);
      setErrMessage('');
    }
  }, [authenticationFailed]);
  return (
    <Box style={styles.container}>
      <KeeperTextInput
        placeholder={''}
        value={password}
        autoCorrect={false}
        secureTextEntry
        autoComplete="off"
        onChangeText={(text) => setPassword(text)}
        inpuBorderColor={`${colorMode}.separator`}
        inpuBackgroundColor={`${colorMode}.boxSecondaryBackground`}
      />
      {loginError && (
        <Text color={`${colorMode}.indicator`} style={styles.errorText}>
          {errMessage}
        </Text>
      )}
      <Box style={styles.btnsContainer}>
        <Buttons
          primaryCallback={() => {
            attemptLogin(password);
          }}
          primaryText={common.continue}
          secondaryText={common.cancel}
          secondaryCallback={() => {
            close();
          }}
        />
      </Box>
    </Box>
  );
};

export default PasswordModalContent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: hp(-10),
  },
  btnsContainer: {
    marginTop: hp(20),
  },
  errorText: {
    textAlign: 'right',
    fontStyle: 'italic',
    marginRight: 10,
  },
});
