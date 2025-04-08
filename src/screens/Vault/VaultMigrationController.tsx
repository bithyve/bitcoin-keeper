import { CommonActions, useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  MiniscriptTypes,
  MultisigScriptType,
  NetworkType,
  SignerType,
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
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { NewVaultInfo } from 'src/store/sagas/wallets';
import { useDispatch } from 'react-redux';
import { captureError } from 'src/services/sentry';
import useVault from 'src/hooks/useVault';
import WalletOperations from 'src/services/wallets/operations';
import useToastMessage, { IToastCategory } from 'src/hooks/useToastMessage';
import { AverageTxFeesByNetwork } from 'src/services/wallets/interfaces';
import WalletUtilities from 'src/services/wallets/operations/utils';
import { sendPhasesReset } from 'src/store/reducers/send_and_receive';
import { sendPhaseOne } from 'src/store/sagaActions/send_and_receive';
import {
  generateMiniscriptScheme,
  generateVaultId,
} from 'src/services/wallets/factories/VaultFactory';
import useArchivedVaults from 'src/hooks/useArchivedVaults';
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
import { resetRealyVaultState } from 'src/store/reducers/bhr';
import { resetVaultMigration } from 'src/store/reducers/vaults';
import KeeperModal from 'src/components/KeeperModal';
import useSigners from 'src/hooks/useSigners';
import { Box } from 'native-base';
import Text from 'src/components/KeeperText';

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
  setVaultCreatedModalVisible = null,
}) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();
  const { activeVault, allVaults } = useVault({ vaultId });
  const temporaryVault = useAppSelector((state) => state.vault.intrimVault);
  const hasMigrationSucceeded = useAppSelector((state) => state.vault.hasMigrationSucceeded);
  const migrationError = useAppSelector((state) => state.vault.error);
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
  const { relayVaultUpdate, relayVaultError, realyVaultErrorMessage } = useAppSelector(
    (state) => state.bhr
  );
  const [savedGeneratedVaultId, setSavedGeneratedVaultId] = useState(null);
  const [newVault, setNewVault] = useState(null);
  const [checkAddressModalVisible, setCheckAddressModalVisible] = useState(false);
  const { vaultSigners } = useSigners(activeVault?.id);
  const { bitcoinNetworkType } = useAppSelector((state) => state.settings);

  const DEVICES_WITH_SCREEN = [
    SignerType.BITBOX02,
    SignerType.COLDCARD,
    SignerType.JADE,
    SignerType.KEEPER,
    SignerType.KEYSTONE,
    SignerType.LEDGER,
    SignerType.OTHER_SD,
    SignerType.PASSPORT,
    SignerType.PORTAL,
    SignerType.SEEDSIGNER,
    SignerType.SPECTER,
    SignerType.TREZOR,
  ];

  useFocusEffect(
    useCallback(() => {
      if (temporaryVault && temporaryVault.id) {
        setGeneratedVaultId(temporaryVault.id);
        setSavedGeneratedVaultId(temporaryVault.id);
        setNewVault(temporaryVault);
      }
    }, [temporaryVault])
  );

  useFocusEffect(
    useCallback(() => {
      if (vaultCreating) {
        initiateNewVault().catch((err) => {
          console.log('Vault creation error:', err);
          captureError(err);
          setCreating(false);
        });
      }
    }, [vaultCreating])
  );

  useFocusEffect(
    useCallback(() => {
      if (vaultId && temporaryVault) {
        dispatch(sendPhasesReset());
        createNewVault();
      }
    }, [temporaryVault, vaultId])
  );

  useEffect(() => {
    dispatch(sendPhasesReset());
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (sendPhaseOneState.isSuccessful && newVault) {
        setCreating(false);

        navigation.dispatch(
          CommonActions.reset({
            index: 2,
            routes: [
              { name: 'Home' },
              { name: 'VaultDetails', params: { vaultId: activeVault.id } },
              {
                name: 'SendConfirmation',
                params: {
                  sender: activeVault,
                  internalRecipients: [newVault],
                  addresses: [recipients[0].address],
                  amounts: [parseInt(recipients[0].amount, 10)],
                  currentBlockHeight,
                  miniscriptSelectedSatisfier,
                },
              },
            ],
          })
        );
      } else if (sendPhaseOneState.hasFailed) {
        if (sendPhaseOneState.failedErrorMessage === 'Insufficient balance') {
          showToast('You have insufficient balance at this time.', <ToastErrorIcon />);
        } else showToast(sendPhaseOneState.failedErrorMessage, <ToastErrorIcon />);
      }
    }, [sendPhaseOneState, newVault, activeVault, recipients, miniscriptSelectedSatisfier])
  );

  const initiateSweep = () => {
    dispatch(resetVaultMigration());
    const averageTxFeeByNetwork = averageTxFees[activeVault.networkType];
    const { feePerByte } = averageTxFeeByNetwork[TxPriority.LOW];
    const receivingAddress = WalletOperations.getNextFreeAddress(newVault);

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

    if (sendMaxFee && newVault) {
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
    dispatch(finaliseVaultMigration(activeVault.id));
  };

  useFocusEffect(
    useCallback(() => {
      const newVault = allVaults.filter((v) => v.id === savedGeneratedVaultId)[0];
      if (activeVault && !hasMigrationSucceeded && !migrationError) {
        return;
      }
      if ((relayVaultUpdate || hasMigrationSucceeded) && newVault) {
        dispatch(resetRealyVaultState());
        setCreating(false);
        const netBanalce = confirmed + unconfirmed;

        if (vaultId && netBanalce !== 0 && hasMigrationSucceeded) {
          if (vaultSigners.some((signer) => DEVICES_WITH_SCREEN.includes(signer.type))) {
            setCheckAddressModalVisible(true);
          } else {
            initiateSweep();
          }
          return;
        }
        if (migrationError) {
          showToast(migrationError.toString(), <ToastErrorIcon />);
        }
        dispatch(resetVaultMigration());

        if (setVaultCreatedModalVisible) {
          setVaultCreatedModalVisible(true);
          return;
        }

        const navigationState = {
          index: 1,
          routes: [
            { name: 'Home' },
            {
              name: 'VaultDetails',
              params: { vaultId: savedGeneratedVaultId, vaultTransferSuccessful: true },
            },
          ],
        };
        navigation.dispatch(CommonActions.reset(navigationState));
      } else if (relayVaultUpdate) {
        navigation.dispatch(CommonActions.reset({ index: 1, routes: [{ name: 'Home' }] }));
        dispatch(resetRealyVaultState());
        setCreating(false);
      }

      if (relayVaultError) {
        showToast(realyVaultErrorMessage, <ToastErrorIcon />);
        dispatch(resetRealyVaultState());
        setCreating(false);
      }
    }, [
      hasMigrationSucceeded,
      migrationError,
      vaultId,
      relayVaultUpdate,
      relayVaultError,
      savedGeneratedVaultId,
      allVaults,
      navigation,
      dispatch,
    ])
  );

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
        const timelock = getTimelockDuration(duration, bitcoinNetworkType);
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
        const timelock = getTimelockDuration(duration, bitcoinNetworkType);
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
        setSavedGeneratedVaultId(generatedVaultId);
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
            const receivingAddress = WalletOperations.getNextFreeAddress(newVault);
            proceedWithSweep(receivingAddress, feePerByte, satisfier);
          }}
          onError={(err) => showToast(err, <ToastErrorIcon />)}
          onCancel={() => setCreating(false)}
        />
      )}

      <KeeperModal
        visible={checkAddressModalVisible}
        closeOnOverlayClick={false}
        close={() => {
          setCheckAddressModalVisible(false);
          dispatch(resetVaultMigration());
          showToast(
            'Wallet update initiated successfully, you can continue transferring the funds from the Send tab.',
            null,
            IToastCategory.DEFAULT,
            6000
          );
          setTimeout(() => {
            navigation.dispatch(
              CommonActions.reset({
                index: 1,
                routes: [
                  { name: 'Home' },
                  { name: 'VaultDetails', params: { vaultId: activeVault.id } },
                ],
              })
            );
          }, 200);
        }}
        title="Verify the new wallet address"
        Content={() => (
          <Box style={{ gap: 20 }}>
            <Text>
              Your updated wallet has been successfully created and is ready to receive funds from
              the previous wallet.
            </Text>
            <Text>
              We recommend verifying the new wallet address on your hardware device before
              transferring funds.
            </Text>
            <Text>
              You can transfer the funds now or later. Your old wallet will remain visible in the
              Wallets tab until the transfer is complete.
            </Text>
          </Box>
        )}
        modalBackground="modalWhiteBackground"
        textColor="modalHeaderTitle"
        subTitleColor="modalSubtitleBlack"
        buttonText="Check address"
        secondaryButtonText="Transfer funds"
        buttonCallback={() => {
          setCheckAddressModalVisible(false);
          navigation.dispatch(CommonActions.navigate('Receive', { wallet: newVault }));
        }}
        secondaryCallback={() => {
          setCheckAddressModalVisible(false);
          initiateSweep();
        }}
      />
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
