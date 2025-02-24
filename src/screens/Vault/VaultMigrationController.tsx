import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState, useRef } from 'react';
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
  MiniscriptTxSelectedSatisfier,
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
import useArchivedVaults from 'src/hooks/useArchivedVaults';
import config from 'src/utils/service-utilities/config';
import {
  MONTHS_12,
  MONTHS_3,
  MONTHS_6,
  MONTHS_18,
  MONTHS_24,
  MONTHS_30,
  MONTHS_36,
  MONTHS_42,
  MONTHS_48,
  MONTHS_54,
  MONTHS_60,
} from './constants';
import MiniscriptPathSelector, {
  MiniscriptPathSelectorRef,
} from 'src/components/MiniscriptPathSelector';
import {
  ENHANCED_VAULT_TIMELOCKS_MAINNET,
  ENHANCED_VAULT_TIMELOCKS_TESTNET,
  generateEnhancedVaultElements,
} from 'src/services/wallets/operations/miniscript/default/EnhancedVault';
import { getKeyUID } from 'src/utils/utilities';

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
  inheritanceKeys = [],
  emergencyKeys = [],
  currentBlockHeight = null,
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
  const miniscriptPathSelectorRef = useRef<MiniscriptPathSelectorRef>(null);
  const [miniscriptSelectedSatisfier, setMiniscriptSelectedSatisfier] = useState(null);

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
                internalRecipients: [temporaryVault],
                addresses: [recipients[0].address],
                amounts: [parseInt(recipients[0].amount, 10)],
                transferType: TransferType.VAULT_TO_VAULT,
                currentBlockHeight,
                miniscriptSelectedSatisfier,
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
            internalRecipients: [temporaryVault],
            addresses: [recipients[0].address],
            amounts: [parseInt(recipients[0].amount, 10)],
            transferType: TransferType.VAULT_TO_VAULT,
            miniscriptSelectedSatisfier,
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

    if (activeVault.type === VaultType.MINISCRIPT) {
      miniscriptPathSelectorRef.current?.selectVaultSpendingPaths();
      return;
    }

    proceedWithSweep(receivingAddress, feePerByte);
  };

  const proceedWithSweep = (
    receivingAddress: string,
    feePerByte: number,
    satisfier?: MiniscriptTxSelectedSatisfier
  ) => {
    const { fee: sendMaxFee } = WalletOperations.calculateSendMaxFee(
      activeVault,
      [{ address: receivingAddress, amount: 0 }],
      feePerByte,
      null,
      satisfier
    );

    if (sendMaxFee && temporaryVault) {
      const maxBalance = confirmed + unconfirmed - sendMaxFee;
      setRecepients([{ address: receivingAddress, amount: maxBalance }]);
      dispatch(
        sendPhaseOne({
          wallet: activeVault,
          recipients: [{ address: receivingAddress, amount: maxBalance }],
          miniscriptSelectedSatisfier: satisfier,
        })
      );
    }
  };

  const createNewVault = () => {
    const netBanalce = confirmed + unconfirmed;
    if (netBanalce === 0) {
      dispatch(finaliseVaultMigration(activeVault.id));
    } else {
      // TODO: get miniscript selected satisfier!
      initiateSweep();
    }
  };

  const getTimelockDuration = (selectedDuration, networkType) => {
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
        : selectedDuration === MONTHS_42
        ? 'MONTHS_42'
        : selectedDuration === MONTHS_48
        ? 'MONTHS_48'
        : selectedDuration === MONTHS_54
        ? 'MONTHS_54'
        : selectedDuration === MONTHS_60
        ? 'MONTHS_60'
        : null;

    if (!durationIdentifier) {
      showToast('Invalid duration selected', <ToastErrorIcon />);
      return;
    }

    return networkType === NetworkType.MAINNET
      ? ENHANCED_VAULT_TIMELOCKS_MAINNET[durationIdentifier]
      : ENHANCED_VAULT_TIMELOCKS_TESTNET[durationIdentifier];
  };

  const prepareMiniscriptScheme = async (
    vaultInfo: NewVaultInfo,
    miniscriptTypes: MiniscriptTypes[],
    inheritanceSigners?: { key: VaultSigner; duration: string }[],
    emergencySigners?: { key: VaultSigner; duration: string }[],
    existingMiniscriptScheme?: MiniscriptScheme
  ) => {
    if (
      vaultInfo.vaultType !== VaultType.MINISCRIPT ||
      !(
        miniscriptTypes.includes(MiniscriptTypes.INHERITANCE) ||
        miniscriptTypes.includes(MiniscriptTypes.EMERGENCY)
      )
    ) {
      showToast(
        'Invalid vault type - supported only for inheritance and emergency',
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

    const inheritanceSignerWithTimelocks = [];
    const emergencySignerWithTimelocks = [];

    if (inheritanceSigners?.length) {
      for (const { key, duration } of inheritanceSigners) {
        const timelock = getTimelockDuration(duration, config.NETWORK_TYPE);
        if (!timelock) {
          showToast('Failed to determine inheritance timelock duration', <ToastErrorIcon />);
          return;
        }
        inheritanceSignerWithTimelocks.push({
          signer: key,
          timelock: currentBlockHeight + timelock,
        });
      }
    }

    if (emergencySigners?.length) {
      for (const { key, duration } of emergencySigners) {
        const timelock = getTimelockDuration(duration, config.NETWORK_TYPE);
        if (!timelock) {
          showToast('Failed to determine emergency timelock duration', <ToastErrorIcon />);
          return;
        }
        emergencySignerWithTimelocks.push({ signer: key, timelock: currentBlockHeight + timelock });
      }
    }

    let miniscriptElements: MiniscriptElements = generateEnhancedVaultElements(
      vaultInfo.vaultSigners,
      inheritanceSignerWithTimelocks,
      emergencySignerWithTimelocks,
      vaultInfo.vaultScheme
    );

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
      vaultInfo.vaultSigners = [
        ...vaultInfo.vaultSigners,
        ...inheritanceSignerWithTimelocks.map(({ signer }) => signer),
      ];
    }

    if (miniscriptTypes.includes(MiniscriptTypes.EMERGENCY)) {
      vaultInfo.vaultSigners = [
        ...vaultInfo.vaultSigners,
        ...emergencySignerWithTimelocks
          .map(({ signer }) => signer)
          .filter(
            (signer) => !vaultInfo.vaultSigners.find((vs) => getKeyUID(vs) === getKeyUID(signer))
          ),
      ];
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

      if (vaultType === VaultType.MINISCRIPT) {
        try {
          vaultInfo = await prepareMiniscriptScheme(
            vaultInfo,
            miniscriptTypes,
            inheritanceKeys,
            emergencyKeys,
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

  return (
    <>
      {activeVault && (
        <MiniscriptPathSelector
          ref={miniscriptPathSelectorRef}
          vault={activeVault}
          onPathSelected={(satisfier) => {
            setMiniscriptSelectedSatisfier(satisfier);
            const averageTxFeeByNetwork = averageTxFees[activeVault.networkType];
            const { feePerByte } = averageTxFeeByNetwork[TxPriority.LOW];
            const receivingAddress = WalletOperations.getNextFreeAddress(temporaryVault);
            proceedWithSweep(receivingAddress, feePerByte, satisfier);
          }}
          onError={(err) => showToast(err, <ToastErrorIcon />)}
          onCancel={() => setCreating(false)}
        />
      )}
    </>
  );
}

export const vaultAlreadyExists = (vaultInfo: NewVaultInfo, allVaults, archivedVaults) => {
  const allVaultIds = allVaults.map((vault) => vault.id);
  const deletedVaultIds = archivedVaults.map((vault) => vault.id);

  const generatedVaultId = generateVaultId(vaultInfo.vaultSigners, vaultInfo.vaultScheme);
  return allVaultIds.includes(generatedVaultId) && !deletedVaultIds.includes(generatedVaultId);
};

export default VaultMigrationController;
