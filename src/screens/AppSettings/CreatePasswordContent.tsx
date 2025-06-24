import { Box, useColorMode } from 'native-base';
import React, { useContext, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import Buttons from 'src/components/Buttons';
import Text from 'src/components/KeeperText';
import KeeperTextInput from 'src/components/KeeperTextInput';
import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import LoginMethod from 'src/models/enums/LoginMethod';
import { useAppSelector } from 'src/store/hooks';
import { setFallbackLoginMethod } from 'src/store/reducers/settings';
import { changeAuthCred } from 'src/store/sagaActions/login';

interface Props {
  close?: () => void;
  onSuccess?: (method: LoginMethod) => void;
  oldPassword?: string;
}

const CreatePasswordContent = ({ close, onSuccess, oldPassword }: Props) => {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const dispatch = useDispatch();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { loginMethod }: { loginMethod: LoginMethod } = useAppSelector((state) => state.settings);

  const handleContinue = () => {
    if (!password || !confirmPassword) {
      setError('Please fill out both fields');
    } else if (password !== confirmPassword) {
      setError('Passwords do not match');
    } else {
      setError('');
      dispatch(changeAuthCred(oldPassword, password));
      if (loginMethod === LoginMethod.BIOMETRIC) {
        dispatch(setFallbackLoginMethod(LoginMethod.PASSWORD));
      }
      onSuccess(LoginMethod.PASSWORD);
      close();
    }
  };

  return (
    <Box style={styles.container}>
      <KeeperTextInput
        placeholder={'Enter password'}
        value={password}
        autoCorrect={false}
        autoComplete="off"
        secureTextEntry
        onChangeText={setPassword}
        inpuBorderColor={`${colorMode}.separator`}
        inpuBackgroundColor={`${colorMode}.boxSecondaryBackground`}
      />
      <KeeperTextInput
        placeholder={'Confirm password'}
        value={confirmPassword}
        autoCorrect={false}
        autoComplete="off"
        secureTextEntry
        onChangeText={setConfirmPassword}
        inpuBorderColor={`${colorMode}.separator`}
        inpuBackgroundColor={`${colorMode}.boxSecondaryBackground`}
        containerStyle={{ marginTop: 15 }}
      />
      {!!error && (
        <Text color={`${colorMode}.indicator`} style={styles.errorText}>
          {error}
        </Text>
      )}
      <Box style={styles.btnsContainer}>
        <Buttons
          primaryCallback={handleContinue}
          primaryText={common.continue}
          secondaryText={common.cancel}
          secondaryCallback={close}
        />
      </Box>
    </Box>
  );
};

export default CreatePasswordContent;

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
    marginTop: 8,
  },
});
