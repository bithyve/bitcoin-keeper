import { useEffect, useState } from 'react';
import { ParsedVauleText, parseTextforVaultConfig } from 'src/core/utils';
import { generateSignerFromMetaData } from 'src/hardware';
import { SignerStorage, SignerType, VaultType } from 'src/core/wallets/enums';
import { useAppSelector } from 'src/store/hooks';
import { NewVaultInfo } from 'src/store/sagas/wallets';
import { useDispatch } from 'react-redux';
import { addNewVault, addSigningDevice } from 'src/store/sagaActions/vaults';
import { captureError } from 'src/services/sentry';
import { Signer, VaultScheme, VaultSigner } from 'src/core/wallets/interfaces/vault';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { resetRealyVaultState } from 'src/store/reducers/bhr';
import { generateVaultId } from 'src/core/wallets/factories/VaultFactory';
import useToastMessage from './useToastMessage';
import useVault from './useVault';

const useConfigRecovery = () => {
  const { relayVaultError, relayVaultUpdate } = useAppSelector((state) => state.bhr);

  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [scheme, setScheme] = useState<VaultScheme>();
  const [vaultSignersList, setVaultSignersList] = useState<VaultSigner[]>([]);
  const { showToast } = useToastMessage();
  const [signersList, setSignersList] = useState<Signer[]>([]);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { allVaults } = useVault({});

  const recoveryError = {
    failed: false,
    message: '',
  };

  useEffect(() => {
    if (scheme && signersList?.length > 1 && vaultSignersList?.length > 1) {
      const generatedVaultId = generateVaultId(vaultSignersList, scheme);
      if (allVaults.find((vault) => vault.id === generatedVaultId)) {
        dispatch(resetRealyVaultState());
        setRecoveryLoading(false);
        showToast('A vault already exists with similar configuration!');
        return;
      }
      try {
        dispatch(addSigningDevice(signersList));
        const vaultInfo: NewVaultInfo = {
          vaultType: VaultType.DEFAULT,
          vaultScheme: scheme,
          vaultSigners: vaultSignersList,
          vaultDetails: {
            name: 'Imported Vault',
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
      const navigationState = {
        index: 0,
        routes: [{ name: 'Home' }],
      };
      dispatch(resetRealyVaultState());
      setRecoveryLoading(false);
      showToast('Vault Imported Successfully!');
      navigation.dispatch(CommonActions.reset(navigationState));
    }
    if (relayVaultError) {
      setRecoveryLoading(false);
    }
  }, [relayVaultUpdate, relayVaultError]);

  const initateRecovery = (text) => {
    setRecoveryLoading(true);
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
        setSignersList(signers);
        setVaultSignersList(vaultSigners);
        setScheme(parsedText.scheme);
      }
    } catch (err) {
      setRecoveryLoading(false);
      recoveryError.failed = true;
      recoveryError.message = err;
    }
  };

  return { recoveryLoading, recoveryError, initateRecovery };
};

export default useConfigRecovery;
