import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  MiniscriptTypes,
  MultisigScriptType,
  NetworkType,
  TxPriority,
  VaultType,
} from 'src/services/wallets/enums';
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
import {
  MONTHS_12,
  MONTHS_3,
  MONTHS_6,
  MONTHS_18,
  MONTHS_24,
  MONTHS_30,
  MONTHS_36,
} from './constants';

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
  miniscriptTypes = [],
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
      initiateNewVault().catch((err) => {
        console.log('Vault creation error:', err);
        captureError(err);
        setCreating(false);
      });
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
      setCreating(false);
      if (
        activeVault.scheme.multisigScriptType === MultisigScriptType.MINISCRIPT_MULTISIG &&
        activeVault.type === VaultType.MINISCRIPT
      ) {
        WalletUtilities.fetchCurrentBlockHeight()
          .then(({ currentBlockHeight }) => {
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

  const getTimelockDuration = (miniscriptTypes, selectedDuration, networkType) => {
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
        : selectedDuration === MONTHS_30
        ? 'MONTHS_30'
        : selectedDuration === MONTHS_36
        ? 'MONTHS_36'
        : null;

    if (!durationIdentifier) {
      showToast('Invalid duration selected', <ToastErrorIcon />);
      return;
    }

    if (miniscriptTypes.includes(MiniscriptTypes.INHERITANCE)) {
      return networkType === NetworkType.MAINNET
        ? INHERITANCE_VAULT_TIMELOCKS_MAINNET[durationIdentifier]
        : INHERITANCE_VAULT_TIMELOCKS_TESTNET[durationIdentifier];
    } else if (miniscriptTypes.includes(MiniscriptTypes.TIMELOCKED)) {
      return networkType === NetworkType.MAINNET
        ? TIMELOCKED_VAULT_TIMELOCKS_MAINNET[durationIdentifier]
        : TIMELOCKED_VAULT_TIMELOCKS_TESTNET[durationIdentifier];
    }
  };

  const prepareMiniscriptScheme = async (
    vaultInfo: NewVaultInfo,
    miniscriptTypes: MiniscriptTypes[],
    inheritanceSigner?: VaultSigner,
    existingMiniscriptScheme?: MiniscriptScheme
  ) => {
    if (
      vaultInfo.vaultType !== VaultType.MINISCRIPT ||
      !(
        miniscriptTypes.includes(MiniscriptTypes.INHERITANCE) ||
        miniscriptTypes.includes(MiniscriptTypes.TIMELOCKED)
      )
    ) {
      showToast(
        'Invalid vault type - supported only for timelocked and inheritance',
        <ToastErrorIcon />
      );
      return;
    }

    // TODO: Support multiple options
    if (miniscriptTypes.length !== 1) {
      showToast(
        'Multiple Minsicript options combined are not currently supported',
        <ToastErrorIcon />
      );
      return;
    }

    const multisigScriptType = MultisigScriptType.MINISCRIPT_MULTISIG;
    let currentSyncedBlockHeight = currentBlockHeight;
    if (!currentSyncedBlockHeight) {
      try {
        currentSyncedBlockHeight = (await WalletUtilities.fetchCurrentBlockHeight())
          .currentBlockHeight;
      } catch (err) {
        console.log('Failed to re-fetch current block height: ' + err);
      }
      if (!currentSyncedBlockHeight) {
        showToast(
          'Failed to fetch current chain data, please check your connection and try again',
          <ToastErrorIcon />
        );
        setCreating(false);
        return;
      }
    }

    if (!selectedDuration) {
      showToast('Please select the duration for timelock', <ToastErrorIcon />);
      return;
    }

    // TODO: Support multiple options
    const timelockDuration = getTimelockDuration(
      miniscriptTypes,
      selectedDuration,
      config.NETWORK_TYPE
    );
    if (!timelockDuration) {
      showToast('Failed to determine timelock duration', <ToastErrorIcon />);
      return;
    }

    const timelocks = [currentBlockHeight + timelockDuration];

    let miniscriptElements: MiniscriptElements;
    if (miniscriptTypes.includes(MiniscriptTypes.TIMELOCKED)) {
      miniscriptElements = generateTimelockedVaultElements(
        vaultInfo.vaultSigners,
        vaultInfo.vaultScheme,
        timelocks
      );
    } else if (miniscriptTypes.includes(MiniscriptTypes.INHERITANCE)) {
      miniscriptElements = generateInheritanceVaultElements(
        vaultInfo.vaultSigners,
        inheritanceSigner,
        vaultInfo.vaultScheme,
        timelocks
      );
    }

    if (!miniscriptElements) {
      showToast('Failed to generate miniscript elements', <ToastErrorIcon />);
      return;
    }
    vaultInfo.miniscriptElements = miniscriptElements;

    const miniscriptScheme: MiniscriptScheme = generateMiniscriptScheme(
      miniscriptElements,
      miniscriptTypes,
      existingMiniscriptScheme
    );
    const vaultScheme: VaultScheme = {
      ...vaultInfo.vaultScheme,
      multisigScriptType,
      miniscriptScheme,
    };
    vaultInfo.vaultScheme = vaultScheme;

    if (miniscriptTypes.includes(MiniscriptTypes.INHERITANCE)) {
      vaultInfo.vaultSigners = [...vaultInfo.vaultSigners, inheritanceSigner];
    }

    return vaultInfo;
  };

  const initiateNewVault = async () => {
    try {
      let vaultInfo: NewVaultInfo = {
        vaultType,
        vaultScheme: scheme,
        vaultSigners: vaultKeys,
        vaultDetails: {
          name,
          description,
        },
        miniscriptTypes,
      };

      const isTimelockedInheritanceKey = isAddInheritanceKey;
      if (isTimeLock || isTimelockedInheritanceKey) {
        try {
          vaultInfo = await prepareMiniscriptScheme(
            vaultInfo,
            miniscriptTypes,
            inheritanceKey,
            activeVault ? activeVault.scheme.miniscriptScheme : null
          );
        } catch (err) {
          throw Error(`Failed to prepare enhanced vault: ${err.message}`);
        }
        if (!vaultInfo) {
          return;
        }
      }

      if (vaultAlreadyExists(vaultInfo, allVaults, archivedVaults)) {
        throw Error('Wallet with this configuration already exists.');
      }

      if (activeVault) {
        // case: vault migration; old -> new
        dispatch(migrateVault(vaultInfo, activeVault.shellId));
      } else {
        // case: new vault creation
        const generatedVaultId = generateVaultId(vaultInfo.vaultSigners, vaultInfo.vaultScheme);
        setGeneratedVaultId(generatedVaultId);
        dispatch(addNewVault({ newVaultInfo: vaultInfo }));
      }
    } catch (err) {
      showToast(err?.message ? err?.message : err.toString(), <ToastErrorIcon />);
      setCreating(false);
      captureError(err);
    }
  };

  return null;
}

export const vaultAlreadyExists = (vaultInfo: NewVaultInfo, allVaults, archivedVaults) => {
  const allVaultIds = allVaults.map((vault) => vault.id);
  const deletedVaultIds = archivedVaults.map((vault) => vault.id);

  const generatedVaultId = generateVaultId(vaultInfo.vaultSigners, vaultInfo.vaultScheme);
  return allVaultIds.includes(generatedVaultId) && !deletedVaultIds.includes(generatedVaultId);
};

export default VaultMigrationController;
