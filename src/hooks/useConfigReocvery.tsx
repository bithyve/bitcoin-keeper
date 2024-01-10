import { useEffect, useState } from 'react';
import { ParsedVauleText, parseTextforVaultConfig } from 'src/core/utils';
import { generateSignerFromMetaData } from 'src/hardware';
import { SignerStorage, SignerType, VaultType } from 'src/core/wallets/enums';
import { useAppSelector } from 'src/store/hooks';
import { NewVaultInfo } from 'src/store/sagas/wallets';
import { useDispatch } from 'react-redux';
import { addNewVault, addSigningDevice } from 'src/store/sagaActions/vaults';
import { captureError } from 'src/services/sentry';
import { VaultScheme } from 'src/core/wallets/interfaces/vault';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';

const useConfigRecovery = () => {
  const { relayVaultError, relayVaultUpdate, realyVaultErrorMessage } = useAppSelector(
    (state) => state.bhr
  );

  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [scheme, setScheme] = useState<VaultScheme>();
  const [vaultSignersList, setVaultSignersList] = useState([]);
  const [signersList, setSignersList] = useState([]);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (scheme && signersList.length > 1 && vaultSignersList.length > 1) {
      try {
        dispatch(addSigningDevice(signersList, null, true));
        console.log(vaultSignersList[0], signersList[0]);
        const vaultInfo: NewVaultInfo = {
          vaultType: VaultType.DEFAULT,
          vaultScheme: scheme,
          vaultSigners: vaultSignersList,
          vaultDetails: {
            name: 'Vault',
            description: 'Secure your sats',
          },
        };
        dispatch(addNewVault({ newVaultInfo: vaultInfo }));
        setTimeout(() => {}, 3000);
      } catch (err) {
        captureError(err);
      }
      setRecoveryLoading(false);
    }
  }, [scheme, signersList]);

  useEffect(() => {
    if (relayVaultUpdate) {
      setRecoveryLoading(false);
      const navigationState = {
        index: 1,
        routes: [
          { name: 'Home' },
          { name: 'VaultDetails', params: { vaultTransferSuccessful: true } },
        ],
      };
      navigation.dispatch(CommonActions.reset(navigationState));
    }
    if (relayVaultError) {
      setRecoveryLoading(false);
      Alert.alert('Something went wrong!', realyVaultErrorMessage);
    }
  }, [relayVaultUpdate, relayVaultError]);

  const initateRecovery = (text) => {
    setRecoveryLoading(true);
    try {
      const parsedText: ParsedVauleText = parseTextforVaultConfig(text);
      if (parsedText) {
        const vaultSigners = [];
        const signers = [];
        parsedText.signersDetails.forEach((config) => {
          const { signer, key } = generateSignerFromMetaData({
            xpub: config.xpub,
            derivationPath: config.path,
            masterFingerprint: config.masterFingerprint,
            signerType: SignerType.UNKOWN_SIGNER,
            storageType: SignerStorage.WARM,
            isMultisig: config.isMultisig,
          });
          vaultSigners.push(key);
          signers.push(signer);
        });
        setSignersList(signers);
        setVaultSignersList(vaultSigners);
        setScheme(parsedText.scheme);
      }
    } catch (err) {
      setRecoveryLoading(false);
      console.log(err);
      Alert.alert(`Something went wrong!`);
    }
  };

  return { recoveryLoading, initateRecovery };
};

export default useConfigRecovery;
