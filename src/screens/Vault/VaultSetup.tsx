import { StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import { Box, HStack, VStack, useColorMode } from 'native-base';
import { useDispatch } from 'react-redux';

import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperHeader from 'src/components/KeeperHeader';
import KeeperTextInput from 'src/components/KeeperTextInput';
import Text from 'src/components/KeeperText';
import { windowWidth } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import { setVaultRecoveryDetails } from 'src/store/reducers/bhr';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';

const NumberInput = ({ value, onDecrease, onIncrease }) => {
  const { colorMode } = useColorMode();

  return (
    <HStack style={styles.inputContainer} backgroundColor={`${colorMode}.seashellWhite`}>
      <TouchableOpacity style={styles.button} onPress={onDecrease}>
        <Text style={styles.buttonText} color={`${colorMode}.greenText`}>
          -
        </Text>
      </TouchableOpacity>
      <Box style={{ height: 30, borderLeftWidth: 0.2, paddingHorizontal: 5 }} />
      <Text style={styles.buttonValue} bold color={`${colorMode}.greenText`}>
        {value}
      </Text>
      <Box style={{ height: 30, borderRightWidth: 0.2, paddingHorizontal: 5 }} />
      <TouchableOpacity style={styles.button} onPress={onIncrease}>
        <Text style={styles.buttonText} color={`${colorMode}.greenText`}>
          +
        </Text>
      </TouchableOpacity>
    </HStack>
  );
};

const VaultSetup = () => {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const { params } = useRoute();
  const { isRecreation } = (params as { isRecreation: Boolean }) || {};
  const dispatch = useDispatch();
  const [vaultName, setVaultName] = useState('');
  const [vaultDescription, setVaultDescription] = useState('');
  const [scheme, setScheme] = useState({ m: 2, n: 3 });
  const onDecreaseM = () => {
    if (scheme.m > 1) {
      setScheme({ ...scheme, m: scheme.m - 1 });
    }
  };
  const onIncreaseM = () => {
    if (scheme.m > 0 && scheme.m < scheme.n) {
      setScheme({ ...scheme, m: scheme.m + 1 });
    }
  };
  const onDecreaseN = () => {
    if (scheme.n > 1 && scheme.n > scheme.m) {
      setScheme({ ...scheme, n: scheme.n - 1 });
    }
  };
  const onIncreaseN = () => {
    if (scheme.n < 10) {
      setScheme({ ...scheme, n: scheme.n + 1 });
    }
  };
  const OnProceed = () => {
    if (vaultName !== '' && vaultDescription !== '') {
      if (isRecreation) {
        dispatch(
          setVaultRecoveryDetails({
            scheme,
            name: vaultName,
            description: vaultDescription,
          })
        );
        navigation.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' });
      } else {
        navigation.dispatch(
          CommonActions.navigate({
            name: 'AddSigningDevice',
            params: { scheme, name: vaultName, description: vaultDescription },
          })
        );
      }
    } else {
      showToast('Please Enter Vault name and description', <ToastErrorIcon />)
    }
  }

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader title="Setup your Vault" subtitle="Configure your scheme" />
      <VStack style={{ margin: 20, flex: 1 }}>
        <KeeperTextInput
          placeholder="Vault name"
          value={vaultName}
          onChangeText={setVaultName}
          testID={'vault_name'}
          maxLength={20}
        />
        <Box style={{ height: 20 }} />
        <KeeperTextInput
          placeholder="Vault description"
          value={vaultDescription}
          onChangeText={setVaultDescription}
          testID={'vault_description'}
          maxLength={40}
          height={20}
        />
        <Box style={{ marginVertical: 15, borderBottomWidth: 0.17, borderBottomColor: 'grey' }} />
        <Text style={{ fontSize: 14 }}>Total Keys for Vault Configuration</Text>
        <Text style={{ fontSize: 12 }}>Select the total number of keys</Text>
        <NumberInput value={scheme.n} onDecrease={onDecreaseN} onIncrease={onIncreaseN} />
        <Text style={{ fontSize: 14 }}>Required Keys</Text>
        <Text style={{ fontSize: 12 }}>Select the number of keys required</Text>
        <NumberInput value={scheme.m} onDecrease={onDecreaseM} onIncrease={onIncreaseM} />
      </VStack>
      <Buttons
        primaryText="Proceed"
        primaryCallback={OnProceed}
      />
    </ScreenWrapper>
  );
};

export default VaultSetup;

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    fontSize: 30,
    lineHeight: 30,
  },
  buttonValue: {
    fontSize: 17,
    lineHeight: 17,
    margin: 10,
  },
  inputContainer: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: windowWidth * 0.4,
    marginVertical: 20,
  },
});
