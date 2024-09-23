import { StyleSheet, TouchableOpacity } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Box, HStack, ScrollView, VStack, useColorMode } from 'native-base';
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
import useVault from 'src/hooks/useVault';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import config, { APP_STAGE } from 'src/utils/service-utilities/config';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParams } from 'src/navigation/types';
import WalletUtilities from 'src/services/wallets/operations/utils';

function NumberInput({ value, onDecrease, onIncrease }) {
  const { colorMode } = useColorMode();

  return (
    <HStack style={styles.inputContainer} backgroundColor={`${colorMode}.seashellWhite`}>
      <TouchableOpacity testID="btn_decreaseValue" style={styles.button} onPress={onDecrease}>
        <Text style={styles.buttonText} color={`${colorMode}.greenText`}>
          -
        </Text>
      </TouchableOpacity>
      <Box style={{ height: 30, borderLeftWidth: 0.2, paddingHorizontal: 5 }} />
      <Text style={styles.buttonValue} bold color={`${colorMode}.greenText`}>
        {value}
      </Text>
      <Box style={{ height: 30, borderRightWidth: 0.2, paddingHorizontal: 5 }} />
      <TouchableOpacity testID="increaseValue" style={styles.button} onPress={onIncrease}>
        <Text style={styles.buttonText} color={`${colorMode}.greenText`}>
          +
        </Text>
      </TouchableOpacity>
    </HStack>
  );
}

type ScreenProps = NativeStackScreenProps<AppStackParams, 'VaultSetup'>;
function VaultSetup({ route }: ScreenProps) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const {
    isRecreation,
    scheme: preDefinedScheme,
    vaultId,
    isTimeLock = false,
  } = route.params || {};
  const dispatch = useDispatch();
  const { activeVault } = useVault({ vaultId });
  const [vaultName, setVaultName] = useState(
    activeVault?.presentationData?.name || config.ENVIRONMENT === APP_STAGE.DEVELOPMENT
      ? 'Vault'
      : ''
  );
  const [vaultDescription, setVaultDescription] = useState(
    activeVault?.presentationData?.description || ''
  );
  const [scheme, setScheme] = useState(activeVault?.scheme || preDefinedScheme || { m: 3, n: 4 });
  const { translations } = useContext(LocalizationContext);
  const { vault } = translations;
  const [currentBlockHeight, setCurrentBlockHeight] = useState(null);

  useEffect(() => {
    // should bind with a refresher in case the auto fetch for block-height fails
    if (isTimeLock) {
      WalletUtilities.fetchCurrentBlockHeight()
        .then(({ currentBlockHeight }) => {
          setCurrentBlockHeight(currentBlockHeight);
        })
        .catch((err) => showToast(err));
    }
  }, [isTimeLock]);

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
    if (scheme.n > 2 && scheme.n > scheme.m) {
      setScheme({ ...scheme, n: scheme.n - 1 });
    }
  };
  const onIncreaseN = () => {
    if (scheme.n < 10) {
      setScheme({ ...scheme, n: scheme.n + 1 });
    }
  };
  const OnProceed = () => {
    if (vaultName !== '') {
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
        if (isTimeLock && !currentBlockHeight) {
          showToast('Block height not synched');
          return;
        }

        navigation.dispatch(
          CommonActions.navigate({
            name: 'AddSigningDevice',
            params: {
              scheme,
              name: vaultName,
              description: vaultDescription,
              vaultId,
              isTimeLock,
              currentBlockHeight,
            },
          })
        );
      }
    } else {
      showToast('Please Enter vault name', <ToastErrorIcon />);
    }
  };

  // TODO: add learn more modal
  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={
          isTimeLock
            ? vault.timeLockSetupTitle
            : preDefinedScheme
            ? vault.SetupyourVault
            : vault.AddCustomMultiSig
        }
        subtitle={vault.configureScheme}
        // To-Do-Learn-More
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack style={{ margin: 20, flex: 1 }}>
          <KeeperTextInput
            placeholder="Name your vault"
            value={vaultName}
            onChangeText={(value) => {
              if (vaultName === 'Vault') {
                setVaultName('');
              } else {
                setVaultName(value);
              }
            }}
            testID="vault_name"
            maxLength={18}
          />
          <Box />
          <KeeperTextInput
            placeholder="Add a description (Optional)"
            value={vaultDescription}
            onChangeText={setVaultDescription}
            testID="vault_description"
            maxLength={20}
          />
          <Text
            style={{ fontSize: 14, marginTop: 30 }}
            color={`${colorMode}.primaryText`}
            testID="text_totalKeys"
          >
            Total Keys for vault configuration
          </Text>
          <Text
            style={{ fontSize: 12 }}
            color={`${colorMode}.secondaryText`}
            testID="text_totalKeys_subTitle"
          >
            Select the total number of keys
          </Text>
          <NumberInput value={scheme.n} onDecrease={onDecreaseN} onIncrease={onIncreaseN} />
          <Text
            style={{ fontSize: 14 }}
            color={`${colorMode}.primaryText`}
            testID="text_requireKeys"
          >
            Required Keys
          </Text>
          <Text
            style={{ fontSize: 12 }}
            color={`${colorMode}.secondaryText`}
            testID="text_requireKeys_subTitle"
          >
            Minimum number of keys to sign a transaction
          </Text>
          <NumberInput value={scheme.m} onDecrease={onDecreaseM} onIncrease={onIncreaseM} />
        </VStack>
      </ScrollView>
      <Buttons primaryText="Proceed" primaryCallback={OnProceed} />
    </ScreenWrapper>
  );
}

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
  mt20: {
    margin: 20,
  },
});
