import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { MultisigScriptType, NetworkType, TxPriority, VaultType } from 'src/services/wallets/enums';
import {
  MiniscriptElements,
  MiniscriptScheme,
  VaultScheme,
  VaultSigner,
} from 'src/services/wallets/interfaces/vault';
import { addNewVault, finaliseVaultMigration, migrateVault } from 'src/store/sagaActions/vaults';
import { useAppSelector } from 'src/store/hooks';
import { TransferType } from 'src/models/enums/TransferType';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { NewVaultInfo } from 'src/store/sagas/wallets';
import { useDispatch } from 'react-redux';
import { captureError } from 'src/services/sentry';
import useVault from 'src/hooks/useVault';
import WalletOperations from 'src/services/wallets/operations';
import useToastMessage from 'src/hooks/useToastMessage';
import { AverageTxFeesByNetwork } from 'src/services/wallets/interfaces';
import WalletUtilities from 'src/services/wallets/operations/utils';
import { sendPhasesReset } from 'src/store/reducers/send_and_receive';
import { sendPhaseOne } from 'src/store/sagaActions/send_and_receive';
import {
  generateMiniscriptScheme,
  generateVaultId,
} from 'src/services/wallets/factories/VaultFactory';
import { Alert } from 'react-native';
import useArchivedVaults from 'src/hooks/useArchivedVaults';
import {
  TIMELOCKED_VAULT_TIMELOCKS_MAINNET,
  TIMELOCKED_VAULT_TIMELOCKS_TESTNET,
  generateTimelockedVaultElements,
} from 'src/services/wallets/operations/miniscript/default/TimelockedVault';
import config from 'src/utils/service-utilities/config';
import {
  generateInheritanceVaultElements,
  INHERITANCE_VAULT_TIMELOCKS_MAINNET,
  INHERITANCE_VAULT_TIMELOCKS_TESTNET,
} from 'src/services/wallets/operations/miniscript/default/InheritanceVault';
import { MONTHS_12, MONTHS_3, MONTHS_6, MONTHS_18, MONTHS_24 } from './constants';

function VaultMigrationController({
  vaultCreating,
  vaultKeys,
  scheme,
  name,
  description,
  vaultId,
  setCreating,
  setGeneratedVaultId,
  vaultType = VaultType.DEFAULT,
  isTimeLock = false,
  inheritanceKey = null,
  isAddInheritanceKey = false,
  currentBlockHeight = null,
  selectedDuration = null,
}) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();
  const { activeVault, allVaults } = useVault({ vaultId });
  const temporaryVault = useAppSelector((state) => state.vault.intrimVault);
  const averageTxFees: AverageTxFeesByNetwork = useAppSelector(
    (state) => state.network.averageTxFees
  );
  const { confirmed, unconfirmed } = activeVault?.specs?.balances ?? {
    confirmed: 0,
    unconfirmed: 0,
  };
  const sendPhaseOneState = useAppSelector((state) => state.sendAndReceive.sendPhaseOne);
  const { archivedVaults } = useArchivedVaults();

  const [recipients, setRecepients] = useState<any[]>();

  useEffect(() => {
    if (temporaryVault && temporaryVault.id) {
      setGeneratedVaultId(temporaryVault.id);
    }
  }, [temporaryVault]);

  useEffect(() => {
    if (vaultCreating) {
      initiateNewVault();
    }
  }, [vaultCreating]);

  useEffect(() => {
    if (vaultId && temporaryVault) {
      createNewVault();
    }
  }, [temporaryVault]);

  useEffect(() => {
    return () => {
      dispatch(sendPhasesReset());
    };
  }, []);

  useEffect(() => {
    if (sendPhaseOneState.isSuccessful && temporaryVault) {
      if (
        activeVault.scheme.multisigScriptType === MultisigScriptType.MINISCRIPT_MULTISIG &&
        activeVault.type === VaultType.INHERITANCE
      ) {
        WalletUtilities.fetchCurrentBlockHeight()
          .then(({ currentBlockHeight }) => {
            setCreating(false);
            navigation.dispatch(
              CommonActions.navigate('SendConfirmation', {
                sender: activeVault,
                recipient: temporaryVault,
                address: recipients[0].address,
                amount: parseInt(recipients[0].amount, 10),
                transferType: TransferType.VAULT_TO_VAULT,
                currentBlockHeight,
              })
            );
          })
          .catch((err) => {
            captureError(err);
            showToast('Failed to fetch current block height', <ToastErrorIcon />);
          });
      } else {
        navigation.dispatch(
          CommonActions.navigate('SendConfirmation', {
            sender: activeVault,
            recipient: temporaryVault,
            address: recipients[0].address,
            amount: parseInt(recipients[0].amount, 10),
            transferType: TransferType.VAULT_TO_VAULT,
          })
        );
      }
    } else if (sendPhaseOneState.hasFailed) {
      if (sendPhaseOneState.failedErrorMessage === 'Insufficient balance') {
        showToast('You have insufficient balance at this time.', <ToastErrorIcon />);
      } else showToast(sendPhaseOneState.failedErrorMessage, <ToastErrorIcon />);
    }
  }, [sendPhaseOneState]);

  const initiateSweep = () => {
    const averageTxFeeByNetwork = averageTxFees[activeVault.networkType];
    const { feePerByte } = averageTxFeeByNetwork[TxPriority.LOW];
    const receivingAddress = WalletOperations.getNextFreeAddress(temporaryVault);

    const { fee: sendMaxFee } = WalletOperations.calculateSendMaxFee(
      activeVault,
      [{ address: receivingAddress, amount: 0 }],
      feePerByte
    );
    if (sendMaxFee && temporaryVault) {
      const maxBalance = confirmed + unconfirmed - sendMaxFee;

      setRecepients([{ address: receivingAddress, amount: maxBalance }]);
      dispatch(
        sendPhaseOne({
          wallet: activeVault,
          recipients: [{ address: receivingAddress, amount: maxBalance }],
        })
      );
    }
  };

  const createNewVault = () => {
    const netBanalce = confirmed + unconfirmed;
    if (netBanalce === 0) {
      dispatch(finaliseVaultMigration(activeVault.id));
    } else {
      initiateSweep();
    }
  };

  const vaultAlreadyExists = (vaultInfo: NewVaultInfo) => {
    const allVaultIds = allVaults.map((vault) => vault.id);
    const deletedVaultIds = archivedVaults.map((vault) => vault.id);

    const generatedVaultId = generateVaultId(vaultInfo.vaultSigners, vaultInfo.vaultScheme);
    return allVaultIds.includes(generatedVaultId) && !deletedVaultIds.includes(generatedVaultId);
  };

  const getTimelockDuration = (vaultType, selectedDuration, networkType) => {
    const durationIdentifier =
      selectedDuration === MONTHS_3
        ? 'MONTHS_3'
        : selectedDuration === MONTHS_6
        ? 'MONTHS_6'
        : selectedDuration === MONTHS_12
        ? 'MONTHS_12'
        : selectedDuration === MONTHS_18
        ? 'MONTHS_18'
        : selectedDuration === MONTHS_24
        ? 'MONTHS_24'
        : null;

    if (!durationIdentifier) {
      showToast('Invalid duration selected', <ToastErrorIcon />);
      return;
    }

    if (vaultType === VaultType.INHERITANCE) {
      return networkType === NetworkType.MAINNET
        ? INHERITANCE_VAULT_TIMELOCKS_MAINNET[durationIdentifier]
        : INHERITANCE_VAULT_TIMELOCKS_TESTNET[durationIdentifier];
    } else if (vaultType === VaultType.TIMELOCKED) {
      return networkType === NetworkType.MAINNET
        ? TIMELOCKED_VAULT_TIMELOCKS_MAINNET[durationIdentifier]
        : TIMELOCKED_VAULT_TIMELOCKS_TESTNET[durationIdentifier];
    }
  };

  const prepareMiniscriptScheme = (vaultInfo: NewVaultInfo, inheritanceSigner?: VaultSigner) => {
    if (![VaultType.TIMELOCKED, VaultType.INHERITANCE].includes(vaultInfo.vaultType)) {
      throw new Error('Invalid vault type - supported only for timelocked and inheritance');
    }

    const multisigScriptType = MultisigScriptType.MINISCRIPT_MULTISIG;
    if (!currentBlockHeight) {
      showToast('Failed to sync current block height');
      return;
    }

    if (!selectedDuration) {
      showToast('Please select the duration for timelock');
      return;
    }

    const timelockDuration = getTimelockDuration(
      vaultInfo.vaultType,
      selectedDuration,
      config.NETWORK_TYPE
    );
    if (!timelockDuration) {
      showToast('Failed to determine timelock duration', <ToastErrorIcon />);
      return;
    }

    const timelocks = [currentBlockHeight + timelockDuration];

    let miniscriptElements: MiniscriptElements;
    if (vaultInfo.vaultType === VaultType.TIMELOCKED) {
      miniscriptElements = generateTimelockedVaultElements(
        vaultInfo.vaultSigners,
        vaultInfo.vaultScheme,
        timelocks
      );
    } else if (vaultType === VaultType.INHERITANCE) {
      miniscriptElements = generateInheritanceVaultElements(
        vaultInfo.vaultSigners,
        inheritanceSigner,
        vaultInfo.vaultScheme,
        timelocks
      );
    }

    if (!miniscriptElements) {
      showToast('Failed to generate miniscript elements');
      return;
    }
    vaultInfo.miniscriptElements = miniscriptElements;

    const miniscriptScheme: MiniscriptScheme = generateMiniscriptScheme(miniscriptElements);
    const vaultScheme: VaultScheme = {
      ...vaultInfo.vaultScheme,
      multisigScriptType,
      miniscriptScheme,
    };
    vaultInfo.vaultScheme = vaultScheme;

    if (vaultType == VaultType.INHERITANCE) {
      vaultInfo.vaultSigners = [...vaultInfo.vaultSigners, inheritanceSigner];
    }

    return vaultInfo;
  };

  const createVault = useCallback(
    (signers: VaultSigner[], scheme: VaultScheme, vaultType, inheritanceSigner?: VaultSigner) => {
      try {
        let vaultInfo: NewVaultInfo = {
          vaultType,
          vaultScheme: scheme,
          vaultSigners: signers,
          vaultDetails: {
            name,
            description,
          },
        };

        const isTimelockedInheritanceKey = isAddInheritanceKey;
        if (isTimeLock || isTimelockedInheritanceKey) {
          vaultInfo = prepareMiniscriptScheme(vaultInfo, inheritanceSigner);
        }

        if (vaultAlreadyExists(vaultInfo)) {
          Alert.alert('Vault with this configuration already exists.');
          navigation.goBack();
        } else {
          const generatedVaultId = generateVaultId(vaultInfo.vaultSigners, vaultInfo.vaultScheme);
          setGeneratedVaultId(generatedVaultId);
          dispatch(addNewVault({ newVaultInfo: vaultInfo }));
          return vaultInfo;
        }
      } catch (err) {
        captureError(err);
        return false;
      }
    },
    [isTimeLock, isAddInheritanceKey, selectedDuration, currentBlockHeight]
  );

  const initiateNewVault = () => {
    if (activeVault) {
      let vaultInfo: NewVaultInfo = {
        vaultType,
        vaultScheme: scheme,
        vaultSigners: vaultKeys,
        vaultDetails: {
          name,
          description,
        },
      };
      const isTimelockedInheritanceKey = isAddInheritanceKey;
      if (isTimeLock || isTimelockedInheritanceKey) {
        vaultInfo = prepareMiniscriptScheme(vaultInfo, inheritanceKey);
      }

      if (vaultAlreadyExists(vaultInfo)) {
        Alert.alert('Vault with this configuration already exists.');
        navigation.goBack();
      } else {
        dispatch(migrateVault(vaultInfo, activeVault.shellId));
      }
    } else {
      createVault(vaultKeys, scheme, vaultType, inheritanceKey);
    }
  };

  return null;
}

export default VaultMigrationController;
