import { Alert, StyleSheet, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Box } from 'native-base';
import { hp } from 'src/common/data/responsiveness/responsive';
import Fonts from 'src/common/Fonts';
import ScreenWrapper from 'src/components/ScreenWrapper';
import messaging from '@react-native-firebase/messaging';
import HeaderTitle from 'src/components/HeaderTitle';
import Buttons from 'src/components/Buttons';
import { ParsedVauleText, parseTextforVaultConfig } from 'src/core/utils';
import { generateSignerFromMetaData } from 'src/hardware';
import { SignerStorage, SignerType, VaultType } from 'src/core/wallets/enums';
import { useAppSelector } from 'src/store/hooks';
import { NewVaultInfo } from 'src/store/sagas/wallets';
import { useDispatch } from 'react-redux';
import { addNewVault } from 'src/store/sagaActions/vaults';
import { captureError } from 'src/core/services/sentry';
import { setupKeeperApp } from 'src/store/sagaActions/storage';
import { VaultScheme } from 'src/core/wallets/interfaces/vault';

function VaultConfigurationRecovery({ navigation }) {
  const { appId } = useAppSelector((state) => state.storage);
  const { relayVaultError, relayVaultUpdate } = useAppSelector((state) => state.bhr);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [scheme, setScheme] = useState<VaultScheme>();

  const [inputText, setInputText] = useState('');
  const [signersList, setSignersList] = useState([]);

  const dispatch = useDispatch();
  async function createNewApp() {
    try {
      const fcmToken = await messaging().getToken();
      dispatch(setupKeeperApp(fcmToken));
    } catch (error) {
      dispatch(setupKeeperApp());
    }
  }

  useEffect(() => {
    if (appId) {
      try {
        const vaultInfo: NewVaultInfo = {
          vaultType: VaultType.DEFAULT,
          vaultScheme: scheme,
          vaultSigners: signersList,
          vaultDetails: {
            name: 'Vault',
            description: 'Secure your sats',
          },
        };
        dispatch(addNewVault({ newVaultInfo: vaultInfo }));
      } catch (err) {
        captureError(err);
      }
    }
  }, [appId]);

  useEffect(() => {
    if (relayVaultUpdate) {
      setRecoveryLoading(false);
      navigation.replace('App');
    }
    if (relayVaultError) {
      Alert.alert('Something went wrong!');
    }
  }, [relayVaultUpdate, relayVaultError]);

  const initateReocvery = () => {
    setRecoveryLoading(true);
    try {
      const parsedText: ParsedVauleText = parseTextforVaultConfig(inputText);
      if (parsedText) {
        setScheme(parsedText.scheme);
        const signers = [];
        parsedText.signersDetails.forEach((config) => {
          const signer = generateSignerFromMetaData({
            xpub: config.xpub,
            derivationPath: config.path,
            xfp: config.masterFingerprint,
            signerType: SignerType.OTHER_SD,
            storageType: SignerStorage.WARM,
            isMultisig: config.isMultisig,
          });
          signers.push(signer);
        });
        setSignersList(signers);
        createNewApp();
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <ScreenWrapper>
      <HeaderTitle
        title="Reocvery through vault configuration"
        subtitle="Recover the vault from output descriptor or configuration"
        headerTitleColor="light.textBlack"
        paddingTop={hp(5)}
      />
      <Box style={styles.inputWrapper} backgroundColor="light.textInputBackground">
        <TextInput
          placeholder="Enter the vault configuration or output descriptor"
          placeholderTextColor="light.GreyText"
          style={styles.textInput}
          value={inputText}
          onChangeText={(text) => {
            setInputText(text);
          }}
          multiline
        />
      </Box>
      <Buttons
        primaryCallback={initateReocvery}
        primaryText="Recover"
        primaryLoading={recoveryLoading}
      />
    </ScreenWrapper>
  );
}

export default VaultConfigurationRecovery;

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: 'row',
    marginVertical: hp(20),
    marginHorizontal: hp(5),
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  textInput: {
    width: '100%',

    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    padding: 20,
    fontFamily: Fonts.RobotoCondensedRegular,
    opacity: 0.5,
    height: 250,
  },
});
