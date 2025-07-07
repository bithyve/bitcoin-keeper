import { useContext, useEffect, useState } from 'react';
import { ParsedVauleText, parseTextforVaultConfig } from 'src/utils/service-utilities/utils';
import { generateSignerFromMetaData } from 'src/hardware';
import {
  EntityKind,
  SignerStorage,
  SignerType,
  VaultType,
  WalletType,
} from 'src/services/wallets/enums';
import { useAppSelector } from 'src/store/hooks';
import { NewVaultInfo } from 'src/store/sagas/wallets';
import { useDispatch } from 'react-redux';
import { addNewVault, addSigningDevice } from 'src/store/sagaActions/vaults';
import { captureError } from 'src/services/sentry';
import { Signer, VaultSigner } from 'src/services/wallets/interfaces/vault';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { resetRealyVaultState } from 'src/store/reducers/bhr';
import { generateVaultId } from 'src/services/wallets/factories/VaultFactory';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import useToastMessage from './useToastMessage';
import useVault from './useVault';
import WalletUtilities from 'src/services/wallets/operations/utils';
import { Alert } from 'react-native';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { useUSDTWallets } from './useUSDTWallets';
import { USDTWalletType } from 'src/services/wallets/factories/USDTWalletFactory';

const useConfigRecovery = () => {
  const { relayVaultError, relayVaultUpdate } = useAppSelector((state) => state.bhr);

  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const { showToast } = useToastMessage();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { allVaults } = useVault({});
  const { createWallet } = useUSDTWallets();
  const [generatedVaultId, setGeneratedVaultId] = useState(null);
  const { translations } = useContext(LocalizationContext);

  const { importWallet, wallet: walletText, error: errorText } = translations;

  const recoveryError = {
    failed: false,
    message: '',
  };

  const createVault = (
    scheme,
    signersList,
    vaultSignersList,
    miniscriptElements,
    vaultName = importWallet.importedWalletTitle,
    vaultDescription = walletText.secureSats
  ) => {
    setRecoveryLoading(true);
    if (scheme && signersList?.length >= 1 && vaultSignersList?.length >= 1) {
      const generatedVaultId = generateVaultId(vaultSignersList, scheme);
      if (checkIfVaultExists(vaultSignersList, scheme)) return;
      try {
        dispatch(
          addSigningDevice(signersList, () => {
            const vaultInfo: NewVaultInfo = {
              vaultType: miniscriptElements
                ? VaultType.MINISCRIPT
                : scheme.n === 1
                ? VaultType.SINGE_SIG
                : VaultType.DEFAULT,
              vaultScheme: scheme,
              vaultSigners: vaultSignersList,
              vaultDetails: {
                name: vaultName,
                description: vaultDescription,
              },
              miniscriptElements,
            };
            dispatch(addNewVault({ newVaultInfo: vaultInfo }));
            setGeneratedVaultId(generatedVaultId);
          })
        );
      } catch (err) {
        captureError(err);
        Alert.alert(err);
        navigation.goBack();
      } finally {
        setRecoveryLoading(false);
      }
    }
  };

  useEffect(() => {
    if (relayVaultUpdate && generatedVaultId) {
      const navigationState = {
        index: 1,
        routes: [
          { name: 'Home' },
          {
            name: 'VaultDetails',
            params: { autoRefresh: true, hardRefresh: true, vaultId: generatedVaultId },
          },
        ],
      };
      setGeneratedVaultId(null);
      dispatch(resetRealyVaultState());
      setRecoveryLoading(false);
      showToast(walletText.importSuccessful, <TickIcon />);
      navigation.dispatch(CommonActions.reset(navigationState));
    }
    if (relayVaultError) {
      showToast(errorText.importedWalletFailed);
      setRecoveryLoading(false);
    }
  }, [relayVaultUpdate, relayVaultError, generatedVaultId]);

  const initateRecovery = (text, callback = null, entityKind?: EntityKind) => {
    setRecoveryLoading(true);
    setTimeout(async () => {
      if (entityKind === EntityKind.USDT_WALLET) {
        try {
          const mnemonic = text.trim();
          const { newWallet, error } = await createWallet({
            type: USDTWalletType.IMPORTED,
            name: 'USDT Wallet',
            description: 'Imported USDT Wallet',
            importDetails: {
              mnemonic,
            },
          });

          if (newWallet) {
            showToast('USDT wallet imported successfully!', <TickIcon />);
            setTimeout(() => {
              navigation.dispatch(
                CommonActions.navigate({
                  name: 'Home',
                  params: { selectedOption: 'Wallets' },
                })
              );
              setRecoveryLoading(false);
            }, 900);
          } else {
            showToast(`Failed to import USDT wallet: ${error}`, <ToastErrorIcon />);
            setRecoveryLoading(false);
          }
        } catch (err) {
          setRecoveryLoading(false);
          recoveryError.failed = true;
          recoveryError.message = err;
          showToast(err.message ? err.message : err.toString(), <ToastErrorIcon />);
        }

        return;
      }

      if (text.match(/^[XYZTUVxyztuv]pub[1-9A-HJ-NP-Za-km-z]{100,108}$/)) {
        try {
          const importedKey = text.trim();
          const importedKeyType = WalletUtilities.getImportedKeyType(importedKey);
          navigation.navigate('ImportWalletDetails', {
            importedKey,
            importedKeyType,
            type: WalletType.IMPORTED,
            name: importWallet.importedWalletTitle,
            description: importedKeyDetails.watchOnly
              ? walletText.watchOnly
              : importWallet.importedWalletTitle,
          });
          setRecoveryLoading(false);
          return;
        } catch (err) {
          console.log('Failed to import watch only wallet', err);
        }
      }
      try {
        const parsedText: ParsedVauleText = parseTextforVaultConfig(text);
        if (parsedText) {
          const vaultSigners: VaultSigner[] = [];
          const signers: Signer[] = [];
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
          if (callback) {
            setRecoveryLoading(false);
            callback({
              scheme: parsedText.scheme,
              signers,
              vaultSigners,
              miniscriptElements: parsedText.miniscriptElements,
            });
            return;
          } else
            createVault(parsedText.scheme, signers, vaultSigners, parsedText.miniscriptElements);
        }
      } catch (err) {
        setRecoveryLoading(false);
        recoveryError.failed = true;
        recoveryError.message = err;
        showToast(err.message ? err.message : err.toString(), <ToastErrorIcon />);
      }
    }, 100);
  };

  const checkIfVaultExists = (vaultSigners, scheme) => {
    const generatedVaultId = generateVaultId(vaultSigners, scheme);
    if (allVaults.find((vault) => vault.id === generatedVaultId)) {
      Alert.alert(errorText.vaultAlreadyExists);
      dispatch(resetRealyVaultState());
      setRecoveryLoading(false);
      navigation.goBack();
      return true;
    }
    return false;
  };

  return { recoveryLoading, recoveryError, initateRecovery, createVault, checkIfVaultExists };
};

export default useConfigRecovery;
