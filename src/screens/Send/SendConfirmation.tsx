import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Text from 'src/components/KeeperText';
import { Box, useColorMode, Pressable } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { sendPhaseTwo } from 'src/store/sagaActions/send_and_receive';
import { hp, wp } from 'src/constants/responsive';
import Share from 'react-native-share';
import Buttons from 'src/components/Buttons';
import KeeperHeader from 'src/components/KeeperHeader';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ScreenWrapper from 'src/components/ScreenWrapper';
import {
  EntityKind,
  MultisigScriptType,
  NetworkType,
  TxPriority,
  VaultType,
} from 'src/services/wallets/enums';
import { Vault, VaultSigner } from 'src/services/wallets/interfaces/vault';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import {
  customPrioritySendPhaseOneStatusReset,
  sendPhaseTwoReset,
} from 'src/store/reducers/send_and_receive';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import KeeperModal from 'src/components/KeeperModal';
import { TransferType } from 'src/models/enums/TransferType';
import useToastMessage from 'src/hooks/useToastMessage';
import useBalance from 'src/hooks/useBalance';
import useWallets from 'src/hooks/useWallets';
import useVault from 'src/hooks/useVault';
import PasscodeVerifyModal from 'src/components/Modal/PasscodeVerify';
import { InputUTXOs, UTXO } from 'src/services/wallets/interfaces';
import CurrencyTypeSwitch from 'src/components/Switch/CurrencyTypeSwitch';
import FeeInsights from 'src/screens/FeeInsights/FeeInsightsContent';
import useOneDayInsight from 'src/hooks/useOneDayInsight';
import InfoIcon from 'src/assets/images/info-icon.svg';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import HexagonIcon from 'src/components/HexagonIcon';
import useSignerMap from 'src/hooks/useSignerMap';
import { getAvailableMiniscriptPhase } from 'src/services/wallets/factories/VaultFactory';

import InvalidUTXO from 'src/assets/images/invalidUTXO.svg';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ShareGreen from 'src/assets/images/share-arrow-green.svg';
import ShareWhite from 'src/assets/images/share-arrow-white.svg';
import { resetVaultMigration } from 'src/store/reducers/vaults';
import { MANAGEWALLETS, VAULTSETTINGS, WALLETSETTINGS } from 'src/navigation/contants';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import idx from 'idx';
import { cachedTxSnapshot, dropTransactionSnapshot } from 'src/store/reducers/cachedTxn';
import config from 'src/utils/service-utilities/config';
import AmountChangedWarningIllustration from 'src/assets/images/amount-changed-warning-illustration.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import Colors from 'src/theme/Colors';
import ReceiptWrapper from './ReceiptWrapper';
import TransferCard from './TransferCard';
import TransactionPriorityDetails from './TransactionPriorityDetails';
import HighFeeAlert from './HighFeeAlert';
import FeeRateStatementCard from '../FeeInsights/FeeRateStatementCard';
import AmountDetails from './AmountDetails';
import SendSuccessfulContent from './SendSuccessfulContent';
import PriorityModal from './PriorityModal';
import KeyDropdown from './KeyDropdown';
import CustomPriorityModal from './CustomPriorityModal';
import { getKeyUID } from 'src/utils/utilities';
import { SentryErrorBoundary } from 'src/services/sentry';
import WalletUtilities from 'src/services/wallets/operations/utils';

const vaultTransfers = [TransferType.WALLET_TO_VAULT];
const walletTransfers = [TransferType.VAULT_TO_WALLET, TransferType.WALLET_TO_WALLET];
const internalTransfers = [TransferType.VAULT_TO_VAULT];

export interface SendConfirmationRouteParams {
  sender: Wallet | Vault;
  recipient: Wallet | Vault;
  address: string;
  amount: number;
  walletId: string;
  uiMetaData: any;
  transferType: TransferType;
  uaiSetActionFalse: any;
  note: string;
  label: {
    name: string;
    isSystem: boolean;
  }[];
  selectedUTXOs: UTXO[];
  date: Date;
  parentScreen: string;
  transactionPriority: TxPriority;
  customFeePerByte: number;
  currentBlockHeight: number;
}

export interface tnxDetailsProps {
  transactionPriority: TxPriority;
  txFeeInfo: any;
}

export enum ASSISTED_VAULT_ENTITIES {
  UK = 'UK',
  AK1 = 'AK1',
  AK2 = 'AK2',
}

const enum SigningPath {
  UK_PLUS_AK1 = 1,
  UK_PLUS_AK2 = 2,
  UK_ONLY = 3,
  AK_ONLY = 4,
}

const getSigningPathInfoText = (signingPath: SigningPath) => {
  if (signingPath === SigningPath.UK_PLUS_AK1 || signingPath === SigningPath.UK_PLUS_AK2) {
    return 'Both Assisted Keys and User Key can sign.';
  } else if (signingPath === SigningPath.UK_ONLY) return 'User Key can sign.';
  else if (signingPath === SigningPath.AK_ONLY) return 'Both Assisted Keys can sign.';
  else return 'Invalid signing path.';
};

const getSigningPath = (availableSigners) => {
  let signingPath;
  if (availableSigners[ASSISTED_VAULT_ENTITIES.UK]) {
    signingPath = SigningPath.UK_ONLY;
    if (
      availableSigners[ASSISTED_VAULT_ENTITIES.AK1] &&
      availableSigners[ASSISTED_VAULT_ENTITIES.AK2]
    ) {
      signingPath = SigningPath.UK_PLUS_AK1; // singing default w/ AK1
    }
  } else {
    if (
      availableSigners[ASSISTED_VAULT_ENTITIES.AK1] &&
      availableSigners[ASSISTED_VAULT_ENTITIES.AK2]
    ) {
      signingPath = SigningPath.AK_ONLY;
    }
  }

  return signingPath;
};

function SendConfirmation({ route }) {
  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();
  const dispatch = useDispatch();
  const {
    sender,
    recipient,
    address,
    amount: originalAmount,
    walletId,
    transferType,
    uaiSetActionFalse,
    note,
    label,
    selectedUTXOs,
    parentScreen,
    currentBlockHeight,
    transactionPriority: initialTransactionPriority,
    customFeePerByte: initialCustomFeePerByte,
  }: SendConfirmationRouteParams = route.params;
  const txFeeInfo = useAppSelector((state) => state.sendAndReceive.transactionFeeInfo);
  const txRecipientsOptions = useAppSelector(
    (state) => state.sendAndReceive.sendPhaseOne.outputs.txRecipients
  );
  const customTxRecipientsOptions = useAppSelector(
    (state) => state.sendAndReceive.customPrioritySendPhaseOne?.outputs?.customTxRecipients
  );
  const sendMaxFee = useAppSelector((state) => state.sendAndReceive.sendMaxFee);

  const averageTxFees = useAppSelector((state) => state.network.averageTxFees);
  const { isSuccessful: crossTransferSuccess } = useAppSelector(
    (state) => state.sendAndReceive.crossTransfer
  );
  const [customFeePerByte, setCustomFeePerByte] = useState(initialCustomFeePerByte ?? 0);
  const { wallets } = useWallets({ getAll: true });
  const sourceWallet = wallets.find((item) => item?.id === walletId);
  const sourceWalletAmount = sourceWallet?.specs.balances.confirmed - sendMaxFee;

  const { activeVault: defaultVault } = useVault({ includeArchived: false, getFirst: true });

  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslations, common, vault } = translations;

  const { getSatUnit, getBalance, getCurrencyIcon } = useBalance();

  const isDarkMode = colorMode === 'dark';
  const [visibleModal, setVisibleModal] = useState(false);
  const [externalKeySelectionModal, setExternalKeySelectionModal] = useState(false);
  const [visibleTransVaultModal, setVisibleTransVaultModal] = useState(false);
  const [title, setTitle] = useState('Sending to address');
  const [subTitle, setSubTitle] = useState('Review the transaction setup');
  const [confirmPassVisible, setConfirmPassVisible] = useState(false);
  const [transPriorityModalVisible, setTransPriorityModalVisible] = useState(false);
  const [highFeeAlertVisible, setHighFeeAlertVisible] = useState(false);
  const [amountChangedAlertVisible, setAmountChangedAlertVisible] = useState(false);
  const [feeInsightVisible, setFeeInsightVisible] = useState(false);
  const [visibleCustomPriorityModal, setVisibleCustomPriorityModal] = useState(false);
  const [discardUTXOVisible, setDiscardUTXOVisible] = useState(false);
  const [feePercentage, setFeePercentage] = useState(0);
  const OneDayHistoricalFee = useOneDayInsight();
  const [selectedExternalSigner, setSelectedExternalSigner] = useState<VaultSigner | null>(null);
  const [availablePaths, setAvailablePaths] = useState(null);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [selectedPaths, setSelectedPaths] = useState(null);
  const [availableSigners, setAvailableSigners] = useState({});
  const [externalSigners, setExternalSigners] = useState([]);
  const { signerMap } = useSignerMap();

  function SigningInfo({ onPress, availableSigners }) {
    const { colorMode } = useColorMode();

    const signingPath = getSigningPath(availableSigners);
    const disableSelection =
      signingPath === SigningPath.UK_ONLY || signingPath === SigningPath.AK_ONLY;
    return (
      <Pressable disabled={disableSelection} onPress={onPress} style={styles.signingInfoWrapper}>
        <Box style={styles.signingInfoContainer} background={`${colorMode}.seashellWhite`}>
          <HexagonIcon
            width={37}
            height={31}
            icon={<InfoIcon />}
            backgroundColor={Colors.pantoneGreen}
          />
          <Text style={styles.infoText}>{getSigningPathInfoText(signingPath)}</Text>
          <RightArrowIcon style={styles.arrowIcon} />
        </Box>
      </Pressable>
    );
  }

  const initialiseMiniscriptMultisigPaths = async () => {
    // specifically initialises phases/paths for miniscript Vaults(to be generalised w/ the UI)
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
        navigation.goBack();
        return;
      }
    }

    const { phases: availablePhases, signers: availableSigners } = getAvailableMiniscriptPhase(
      sender as Vault,
      currentBlockHeight
    ); // provides available phases/signers(generic)

    // upon generalisation of the UI we should be able to show/set paths
    // in the available phases as the options which are available for the user to choose from

    // currently for Advisor Vault only the latest phase and path are considered and the signers from
    // the latest phase are only available for signing
    if (!availablePhases || availablePhases.length === 0) {
      showToast('No spending paths available; timelock is active');
      navigation.goBack();
    }

    const latestPhase = availablePhases[availablePhases.length - 1];
    const latestSigners = {};

    const pathsAvailable = [];
    latestPhase.paths.forEach((path) => {
      pathsAvailable.push(path);
      path.keys.forEach((key) => {
        latestSigners[key.identifier] = availableSigners[key.identifier];
      });
    });

    setSelectedPhase(latestPhase.id);
    setAvailablePaths(pathsAvailable);
    setAvailableSigners(latestSigners);

    if (sender.type === VaultType.ASSISTED) {
      const latestExtSigners = [];
      for (const key in latestSigners) {
        if (key === ASSISTED_VAULT_ENTITIES.AK1 || key === ASSISTED_VAULT_ENTITIES.AK2) {
          latestExtSigners.push(signerMap[getKeyUID(availableSigners[key])]);
        }
      }
      if (latestExtSigners.length === 2) {
        // case: UK + AK1/AK2
        // set: AK1 as default option
        if (!selectedExternalSigner) setSelectedExternalSigner(latestExtSigners[0]);
      }
      setExternalSigners(latestExtSigners);
    }
  };

  useEffect(() => {
    if (
      sender.entityKind === EntityKind.VAULT &&
      (sender as Vault).scheme.multisigScriptType === MultisigScriptType.MINISCRIPT_MULTISIG
    ) {
      initialiseMiniscriptMultisigPaths().catch((err) => {
        console.log('Initialization error:', err);
      });
    }
  }, []);

  useEffect(() => {
    // Assisted Vault: remapping selected path based on selected signer
    // upon generalising the UI, user should be able to directly select the path from available paths
    // and the additional steps of mapping the available paths to external signers and
    // then remapping the selected signer to the available paths in order to get the selected path can be avoided

    if (!availablePaths) return;

    if (!selectedExternalSigner) {
      if (availablePaths.length === 1) {
        // case: UK only or AK1 + AK2 only
        setSelectedPaths([availablePaths[0].id]);
      } else setSelectedPaths(null); // error case: path is not selected b/w 1.UK + AK1 and 2.UK + AK2
    } else {
      // case: UK + AK1/AK2
      const pathSelected = [];
      availablePaths.forEach((path) => {
        path.keys.forEach((key) => {
          if (getKeyUID(availableSigners[key.identifier]) === getKeyUID(selectedExternalSigner)) {
            pathSelected.push(path.id);
          }
        });
      });
      setSelectedPaths(pathSelected);
    }
  }, [selectedExternalSigner, availablePaths]);

  const isMoveAllFunds =
    parentScreen === MANAGEWALLETS ||
    parentScreen === VAULTSETTINGS ||
    parentScreen === WALLETSETTINGS;
  const serializedPSBTEnvelops = useAppSelector(
    (state) => state.sendAndReceive.sendPhaseTwo.serializedPSBTEnvelops
  );

  const {
    txid: walletSendSuccessful,
    hasFailed: sendPhaseTwoFailed,
    failedErrorMessage: failedSendPhaseTwoErrorMessage,
    cachedTxid, // generated for new transactions as well(in case they get cached)
    cachedTxPriority,
  } = useAppSelector((state) => state.sendAndReceive.sendPhaseTwo);
  const cachedTxn = useAppSelector((state) => state.cachedTxn);
  const snapshot: cachedTxSnapshot = cachedTxn.snapshots[cachedTxid];
  const isCachedTransaction = !!snapshot;
  const cachedTxPrerequisites = idx(snapshot, (_) => _.state.sendPhaseOne.outputs.txPrerequisites);
  const [transactionPriority, setTransactionPriority] = useState(
    isCachedTransaction
      ? cachedTxPriority || TxPriority.LOW
      : initialTransactionPriority || TxPriority.LOW
  );
  const [usualFee, setUsualFee] = useState(0);
  const [topText, setTopText] = useState('');
  const [isFeeHigh, setIsFeeHigh] = useState(false);
  const [isUsualFeeHigh, setIsUsualFeeHigh] = useState(false);

  const [amount, setAmount] = useState(
    isCachedTransaction
      ? originalAmount
      : (txRecipientsOptions?.[transactionPriority] ||
          customTxRecipientsOptions?.[transactionPriority])?.[0]?.amount
  );

  const [customEstBlocks, setCustomEstBlocks] = useState(0);
  const [estimationSign, setEstimationSign] = useState('≈');

  useEffect(() => {
    if (!isCachedTransaction) {
      setAmount(
        (txRecipientsOptions?.[transactionPriority] ||
          customTxRecipientsOptions?.[transactionPriority])?.[0]?.amount
      );
    }
  }, [txRecipientsOptions, customTxRecipientsOptions, transactionPriority]);

  const navigation = useNavigation();

  function checkUsualFee(data: any[]) {
    if (data.length === 0) {
      return;
    }

    const total = data.reduce((sum, record) => sum + record.avgFee_75, 0);
    const historicalAverage = total / data.length;
    const recentFee = data[data.length - 1].avgFee_75;

    const difference = recentFee - historicalAverage;
    const percentageDifference = (difference / historicalAverage) * 100;
    setUsualFee(Math.abs(Number(percentageDifference.toFixed(2))));
    setIsUsualFeeHigh(usualFee > 10);
  }

  useEffect(() => {
    if (OneDayHistoricalFee.length > 0) {
      checkUsualFee(OneDayHistoricalFee);
    }
  }, [OneDayHistoricalFee]);

  useEffect(() => {
    const remove = navigation.addListener('beforeRemove', (e) => {
      e.preventDefault();
      remove();

      const routes = (e.data.action?.payload as any)?.routes || [];
      const isDiscarding = routes.length > 1 ? routes[1]?.params?.isDiscarding : false;

      if (navigation.getState().index > 2 && isCachedTransaction && !isDiscarding) {
        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [{ name: 'Home' }, { name: 'VaultDetails', params: { vaultId: sender?.id } }],
          })
        );
        showToast('New pending transaction saved successfully', <TickIcon />);
      } else {
        navigation.dispatch(e.data.action);
      }
    });
    return remove;
  }, [navigation, isCachedTransaction]);

  useEffect(() => {
    if (vaultTransfers.includes(transferType)) {
      setTitle('Sending to vault');
    } else if (walletTransfers.includes(transferType)) {
      setTitle('Sending to wallet');
    } else if (internalTransfers.includes(transferType)) {
      setTitle('Transfer Funds to the new vault');
      setSubTitle('On-chain transaction incurs fees');
    }
  }, []);

  useEffect(() => {
    let hasHighFee = false;
    const selectedFee = txFeeInfo[transactionPriority?.toLowerCase()].amount;
    if (selectedFee > amount / 10) hasHighFee = true; // if fee is greater than 10% of the amount being sent

    setFeePercentage(Math.trunc((selectedFee / amount) * 100));

    if (hasHighFee) {
      setIsFeeHigh(true);
      setHighFeeAlertVisible(true);
    } else setHighFeeAlertVisible(false);

    if (
      !isCachedTransaction &&
      originalAmount !==
        (txRecipientsOptions?.[transactionPriority] ||
          customTxRecipientsOptions?.[transactionPriority])?.[0]?.amount
    ) {
      setAmountChangedAlertVisible(true);
    }
  }, [transactionPriority, amount]);

  const [inProgress, setProgress] = useState(false);

  const onProceed = () => {
    setProgress(true);
  };

  const handleOptionSelect = useCallback(
    (option: VaultSigner) => {
      if (selectedExternalSigner && getKeyUID(selectedExternalSigner) !== getKeyUID(option)) {
        if (serializedPSBTEnvelops) dispatch(sendPhaseTwoReset()); // reset, existing send phase two vars, upon change of signer
      }
      setSelectedExternalSigner(option);
      setExternalKeySelectionModal(false);
    },
    [selectedExternalSigner, serializedPSBTEnvelops]
  );

  // useEffect(
  //   () => () => {
  //     dispatch(sendPhaseTwoReset());
  //     dispatch(crossTransferReset());
  //   },
  //   []
  // );

  useEffect(() => {
    if (isCachedTransaction) {
      // case: cached transaction; do not reset sendPhase as we already have phase two set via cache
    } else {
      // case: new transaction

      if (inProgress) {
        if (
          sender.entityKind === EntityKind.VAULT &&
          (sender as Vault).scheme.multisigScriptType === MultisigScriptType.MINISCRIPT_MULTISIG
        ) {
          if (!selectedPhase || !selectedPaths) {
            showToast('Invalid phase/path selection', <ToastErrorIcon />);
            return;
          }
        }

        setTimeout(() => {
          dispatch(sendPhaseTwoReset());
          dispatch(
            sendPhaseTwo({
              wallet: sender,
              txnPriority: transactionPriority,
              miniscriptTxElements: {
                selectedPhase,
                selectedPaths,
              },
              note,
              label,
              transferType,
            })
          );
        }, 200);
      }
    }
  }, [inProgress, selectedPhase, selectedPaths]);

  const { activeVault: currentSender } = useVault({ vaultId: sender?.id }); // current state of vault

  const validateUTXOsForCachedTxn = () => {
    // perform UTXO validation for cached transaction

    if (!cachedTxPrerequisites) return false;

    const cachedInputUTXOs: InputUTXOs[] = idx(
      cachedTxPrerequisites,
      (_) => _[transactionPriority].inputs
    );
    if (!cachedInputUTXOs) return false;

    const confirmedUTXOs: InputUTXOs[] = idx(currentSender, (_) => _.specs.confirmedUTXOs) || [];
    const unconfirmedUTXOs: InputUTXOs[] =
      idx(currentSender, (_) => _.specs.unconfirmedUTXOs) || [];

    const currentUTXOSet = [...confirmedUTXOs, ...unconfirmedUTXOs];

    for (const cachedUTXO of cachedInputUTXOs) {
      let found = false;
      for (const currentUTXO of currentUTXOSet) {
        if (cachedUTXO.txId === currentUTXO.txId && cachedUTXO.vout === currentUTXO.vout) {
          found = true;
          break;
        }
      }

      if (!found) return false;
    }

    return true;
  };

  const discardCachedTransaction = () => {
    dispatch(dropTransactionSnapshot({ cachedTxid }));
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          { name: 'Home' },
          { name: 'VaultDetails', params: { vaultId: sender?.id, isDiscarding: true } },
        ],
      })
    );
  };

  useEffect(() => {
    if (serializedPSBTEnvelops && serializedPSBTEnvelops.length && inProgress) {
      if (isCachedTransaction) {
        // perform UTXO validation for cached transaction
        const isValid = validateUTXOsForCachedTxn();
        if (!isValid) {
          // block and show discard alert
          setDiscardUTXOVisible(true);
          return;
        }
      }

      navigation.dispatch(
        CommonActions.navigate('SignTransactionScreen', {
          isMoveAllFunds,
          note,
          label,
          vaultId: sender?.id,
          sender,
          sendConfirmationRouteParams: route.params,
          miniscriptTxElements: {
            selectedPhase,
            selectedPaths,
          },
          tnxDetails: {
            txFeeInfo,
            transactionPriority,
          },
        })
      );
      setProgress(false);
    }
  }, [serializedPSBTEnvelops, selectedPhase, selectedPaths, inProgress]);

  useEffect(
    () => () => {
      dispatch(resetVaultMigration());
    },
    []
  );

  const viewDetails = () => {
    setVisibleModal(false);
    if (vaultTransfers.includes(transferType)) {
      const navigationState = {
        index: 1,
        routes: [
          { name: 'Home' },
          {
            name: 'VaultDetails',
            params: {
              transactionToast: true,
              autoRefresh: true,
              vaultId: recipient.id,
            },
          },
        ],
      };
      navigation.dispatch(CommonActions.reset(navigationState));
    } else {
      const navigationState = {
        index: 1,
        routes: [
          { name: 'Home' },
          {
            name: 'WalletDetails',
            params: { autoRefresh: true, walletId: sender?.id, transactionToast: true },
          },
        ],
      };
      navigation.dispatch(CommonActions.reset(navigationState));
    }
  };

  const viewManageWallets = () => {
    new Promise((resolve, reject) => {
      try {
        const result = dispatch(refreshWallets([sender], { hardRefresh: true }));
        resolve(result);
      } catch (error) {
        reject(error);
      }
    })
      .then(() => {
        setVisibleModal(false);
        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [
              { name: 'Home' },
              {
                name: 'ManageWallets',
              },
            ],
          })
        );
      })
      .catch((error) => {
        console.error('Error refreshing wallets:', error);
      });
  };

  const handleShare = async () => {
    const url = `https://mempool.space${
      config.NETWORK_TYPE === NetworkType.TESTNET ? '/testnet' : ''
    }/tx/${walletSendSuccessful}`;

    try {
      await Share.open({
        message: 'The transaction has been successfully sent. You can track its status here:',
        url,
        title: 'Transaction Details',
      });
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  useEffect(() => {
    if (walletSendSuccessful) {
      setProgress(false);
      setVisibleModal(true);
    }
  }, [walletSendSuccessful]);

  useEffect(() => {
    if (sendPhaseTwoFailed) setProgress(false);
    if (failedSendPhaseTwoErrorMessage) {
      showToast(`Failed to send transaction: ${failedSendPhaseTwoErrorMessage}`);
    }
  }, [sendPhaseTwoFailed]);

  useEffect(() => {
    if (crossTransferSuccess) {
      setVisibleModal(true);
      if (uaiSetActionFalse) {
        uaiSetActionFalse();
      }
    }
  }, [crossTransferSuccess]);

  const toogleFeesInsightModal = () => {
    if (highFeeAlertVisible) {
      setHighFeeAlertVisible(false);
      // To give smooth transcation of modal,
      // After closing highfee modal.
      setTimeout(() => {
        setFeeInsightVisible(true);
      }, 300);
    } else {
      setFeeInsightVisible(!feeInsightVisible);
    }
  };

  const discardUTXOModalContent = () => {
    return (
      <Box style={{ width: wp(280) }}>
        <Box style={styles.imgCtr}>
          <InvalidUTXO />
        </Box>
        <Text color={`${colorMode}.primaryText`} style={styles.highFeeNote}>
          {walletTranslations.discardTnxDesc}
        </Text>
      </Box>
    );
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title="Send Confirmation"
        subtitle={subTitle}
        rightComponent={<CurrencyTypeSwitch />}
        rightComponentPadding={wp(10)}
        rightComponentBottomPadding={hp(5)}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Box style={styles.receiptContainer}>
          <ReceiptWrapper>
            <TransferCard
              title="Amount Transferred from"
              titleFontSize={16}
              titleFontWeight={300}
              subTitle={sender?.presentationData?.name}
              subTitleFontSize={15}
              subTitleFontWeight={200}
              amount={amount}
              amountFontSize={16}
              amountFontWeight={200}
              unitFontSize={13}
              unitFontWeight={200}
            />
            <TransferCard
              title="Sending To"
              titleFontSize={16}
              titleFontWeight={300}
              subTitle={recipient?.presentationData?.name || address}
              subTitleFontSize={15}
              subTitleFontWeight={200}
            />
            <TouchableOpacity
              testID="btn_transactionPriority"
              onPress={() => setTransPriorityModalVisible(true)}
              disabled={isCachedTransaction} // disable change priority for AutoTransfers
            >
              <TransactionPriorityDetails
                disabled={isCachedTransaction}
                transactionPriority={transactionPriority}
                txFeeInfo={txFeeInfo}
                getBalance={getBalance}
                getCurrencyIcon={getCurrencyIcon}
                getSatUnit={getSatUnit}
                estimationSign={estimationSign}
              />
            </TouchableOpacity>
            {OneDayHistoricalFee.length > 0 && (
              <FeeRateStatementCard
                showFeesInsightModal={toogleFeesInsightModal}
                feeInsightData={OneDayHistoricalFee}
              />
            )}
          </ReceiptWrapper>
        </Box>
        <Box style={styles.totalAmountWrapper}>
          <AmountDetails
            title={walletTranslations.totalAmount}
            titleFontSize={16}
            titleFontWeight={300}
            amount={amount}
            amountFontSize={16}
            amountFontWeight={200}
            unitFontSize={12}
            unitFontWeight={200}
          />
          <AmountDetails
            title={walletTranslations.totalFees}
            titleFontSize={16}
            titleFontWeight={300}
            amount={txFeeInfo[transactionPriority?.toLowerCase()]?.amount}
            amountFontSize={16}
            amountFontWeight={200}
            unitFontSize={12}
            unitFontWeight={200}
          />
          <Box style={styles.horizontalLineStyle} borderBottomColor={`${colorMode}.Border`} />
          <AmountDetails
            title={walletTranslations.total}
            titleFontSize={16}
            titleFontWeight={300}
            amount={txFeeInfo[transactionPriority?.toLowerCase()]?.amount + amount}
            amountFontSize={18}
            amountFontWeight={200}
            unitFontSize={12}
            unitFontWeight={200}
          />
        </Box>
      </ScrollView>
      <Buttons
        primaryText={common.confirmProceed}
        secondaryText={isCachedTransaction ? 'Discard' : common.cancel}
        secondaryCallback={() => {
          if (isCachedTransaction) discardCachedTransaction();
          else navigation.goBack();
        }}
        primaryCallback={() => setConfirmPassVisible(true)}
        primaryLoading={inProgress}
      />
      <KeeperModal
        visible={visibleModal}
        close={!isMoveAllFunds ? viewDetails : viewManageWallets}
        title={walletTranslations.SendSuccess}
        subTitle={walletTranslations.transactionBroadcasted}
        DarkCloseIcon={colorMode === 'dark'}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        Content={() => (
          <SendSuccessfulContent
            transactionPriority={transactionPriority}
            amount={amount || sourceWalletAmount}
            sender={sender || sourceWallet}
            recipient={recipient || defaultVault}
            address={address}
            primaryText={
              !isMoveAllFunds ? walletTranslations.ViewWallets : walletTranslations.ManageWallets
            }
            primaryCallback={!isMoveAllFunds ? viewDetails : viewManageWallets}
            secondaryCallback={handleShare}
            secondaryText={common.shareDetails}
            SecondaryIcon={isDarkMode ? <ShareWhite /> : <ShareGreen />}
            primaryButtonWidth={wp(142)}
          />
        )}
      />
      <KeeperModal
        visible={externalKeySelectionModal}
        close={() => setExternalKeySelectionModal(false)}
        title="External Key Selection"
        subTitle="Whose key should be used to sign the transaction along with yours?"
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        buttonTextColor={`${colorMode}.white`}
        showCloseIcon={false}
        buttonText={common.confirm}
        secondaryButtonText={common.cancel}
        Content={() => (
          <Box style={styles.externalKeyModal}>
            <KeyDropdown
              label="Choose External key"
              options={externalSigners}
              selectedOption={selectedExternalSigner}
              onOptionSelect={handleOptionSelect}
            />
          </Box>
        )}
      />
      <KeeperModal
        visible={confirmPassVisible}
        close={() => setConfirmPassVisible(false)}
        title={walletTranslations.confirmPassTitle}
        subTitleWidth={wp(240)}
        subTitle=""
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        Content={() => (
          <PasscodeVerifyModal
            useBiometrics
            close={() => {
              setConfirmPassVisible(false);
            }}
            onSuccess={onProceed}
          />
        )}
      />
      {/* Transaction Priority Modal */}
      <KeeperModal
        visible={transPriorityModalVisible}
        close={() => setTransPriorityModalVisible(false)}
        title={walletTranslations.transactionPriority}
        subTitle={walletTranslations.transactionPrioritySubTitle}
        buttonText={common.confirm}
        buttonCallback={() => {
          setTransPriorityModalVisible(false), setTransactionPriority;
        }}
        secondaryButtonText={common.cancel}
        secondaryCallback={() => setTransPriorityModalVisible(false)}
        Content={() => (
          <PriorityModal
            selectedPriority={transactionPriority}
            setSelectedPriority={setTransactionPriority}
            averageTxFees={averageTxFees[config.NETWORK_TYPE]}
            txFeeInfo={txFeeInfo}
            customFeePerByte={customFeePerByte}
            onOpenCustomPriorityModal={() => {
              dispatch(customPrioritySendPhaseOneStatusReset());
              setVisibleCustomPriorityModal(true);
            }}
            customEstBlocks={customEstBlocks}
            setCustomEstBlocks={setCustomEstBlocks}
            estimationSign={estimationSign}
            setEstimationSign={setEstimationSign}
          />
        )}
      />
      {/* High fee alert Modal */}
      <KeeperModal
        visible={highFeeAlertVisible}
        close={() => setHighFeeAlertVisible(false)}
        showCloseIcon={false}
        title={walletTranslations.highFeeAlert}
        subTitleWidth={wp(240)}
        subTitle={topText}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        buttonTextColor={`${colorMode}.buttonText`}
        buttonBackground={`${colorMode}.greenButtonBackground`}
        secButtonTextColor={`${colorMode}.greenText`}
        buttonText={common.proceed}
        secondaryButtonText={common.cancel}
        secondaryCallback={() => setHighFeeAlertVisible(false)}
        buttonCallback={() => {
          setHighFeeAlertVisible(false);
        }}
        Content={() => (
          <HighFeeAlert
            transactionPriority={transactionPriority}
            txFeeInfo={txFeeInfo}
            amountToSend={amount}
            isFeeHigh={isFeeHigh}
            isUsualFeeHigh={isUsualFeeHigh}
            setTopText={setTopText}
          />
        )}
      />
      {/* Amount changed Modal */}
      <KeeperModal
        visible={amountChangedAlertVisible}
        close={() => setAmountChangedAlertVisible(false)}
        showCloseIcon={false}
        title={walletTranslations.transactionAmountChangedTitle}
        subTitle={walletTranslations.transactionAmountChangedSubtitle}
        buttonText={common.proceed}
        buttonCallback={() => {
          setAmountChangedAlertVisible(false);
        }}
        Content={() => (
          <Box
            marginBottom={hp(15)}
            alignContent="center"
            justifyContent="center"
            justifyItems="center"
            width="100%"
          >
            <AmountChangedWarningIllustration
              style={{ alignSelf: 'center', marginRight: wp(30), marginTop: hp(5) }}
            />
            <Text style={{ marginTop: hp(40) }} fontSize={14}>
              {walletTranslations.transactionAmountChangedExplainer}
            </Text>
          </Box>
        )}
      />
      {/* Fee insight Modal */}
      <KeeperModal
        visible={feeInsightVisible}
        close={toogleFeesInsightModal}
        showCloseIcon={false}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        buttonTextColor={`${colorMode}.buttonText`}
        buttonBackground={`${colorMode}.greenButtonBackground`}
        buttonText={common.proceed}
        buttonCallback={toogleFeesInsightModal}
        Content={() => <FeeInsights />}
      />
      {/* Discard UTXO Modal */}
      <KeeperModal
        showCloseIcon={false}
        visible={discardUTXOVisible}
        close={() => {}}
        dismissible={false}
        title={walletTranslations.discardTnxTitle}
        subTitle={walletTranslations.discardTnxSubTitle}
        subTitleColor={`${colorMode}.secondaryText`}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.primaryText`}
        buttonBackground={`${colorMode}.greenButtonBackground`}
        buttonText="Discard"
        buttonCallback={discardCachedTransaction}
        buttonTextColor={`${colorMode}.buttonText`}
        secondaryButtonText="Cancel"
        secondaryCallback={() => {
          setProgress(false);
          setDiscardUTXOVisible(false);
        }}
        Content={discardUTXOModalContent}
        subTitleWidth={wp(280)}
      />
      {visibleCustomPriorityModal && (
        <CustomPriorityModal
          visible={visibleCustomPriorityModal}
          close={() => setVisibleCustomPriorityModal(false)}
          title={vault.CustomPriority}
          secondaryButtonText={common.Goback}
          secondaryCallback={() => setVisibleCustomPriorityModal(false)}
          subTitle="Enter amount in sats/vbyte"
          network={sender?.networkType || sourceWallet?.networkType}
          recipients={[{ address, amount: originalAmount }]} // TODO: rewire for Batch Send
          sender={sender || sourceWallet}
          selectedUTXOs={selectedUTXOs}
          buttonCallback={(setCustomTxPriority, customFeePerByte) => {
            setVisibleCustomPriorityModal(false);
            if (setCustomTxPriority) {
              setTransactionPriority(TxPriority.CUSTOM);
              setCustomFeePerByte(customFeePerByte);
            } else {
              if (customFeePerByte === '0') {
                setTransPriorityModalVisible(false);
                showToast('Fee rate cannot be less than 1 sat/vbyte', <ToastErrorIcon />);
              }
            }
          }}
          existingCustomPriorityFee={customFeePerByte}
        />
      )}
    </ScreenWrapper>
  );
}
export default SentryErrorBoundary(SendConfirmation);

const styles = StyleSheet.create({
  horizontalLineStyle: {
    borderBottomWidth: 0.3,
    marginTop: hp(12),
    marginBottom: hp(6),
    opacity: 0.5,
  },
  highFeeNote: {
    fontSize: 13,
    letterSpacing: 0.13,
  },
  container: {
    flex: 1,
    marginHorizontal: wp(0),
  },
  contentContainer: {
    paddingBottom: hp(30),
  },
  sendSuccessfullNote: {
    marginTop: hp(5),
  },
  TransferCardPreTitle: {
    marginLeft: wp(5),
    fontSize: 14,
    letterSpacing: 0.14,
  },
  transferCardTitle: {
    fontSize: 11,
    letterSpacing: 0.14,
  },
  transferCardSubtitle: {
    fontSize: 14,
    letterSpacing: 0.72,
  },
  transferCardContainer: {
    alignItems: 'center',
    borderRadius: 10,

    paddingHorizontal: 10,
    paddingVertical: 15,
    minHeight: hp(70),
  },
  preTitleContainer: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 10,
  },
  transferText: {
    fontWeight: 500,
    fontSize: 12,
    marginBottom: 5,
    marginLeft: 3,
    marginTop: 15,
  },
  cardTransferPreTitle: {
    marginLeft: wp(5),
    fontSize: 14,
    letterSpacing: 0.14,
  },
  subTitleContainer: {
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
    marginLeft: 10,
  },
  sendingPriorityText: {
    fontSize: 15,
    letterSpacing: 0.15,
    marginBottom: hp(5),
  },
  satsStyle: {
    height: hp(500),
  },
  dollarsStyle: {},
  marginBottom: {
    marginBottom: hp(20),
  },
  externalKeyModal: {
    width: '100%',
  },
  signingInfoWrapper: {
    alignItems: 'center',
    alignSelf: 'center',
    width: '85%',
  },
  signingInfoContainer: {
    alignSelf: 'center',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: hp(20),
    paddingHorizontal: wp(18),
    marginTop: hp(5),
    marginBottom: hp(20),
  },
  infoText: {
    width: '68%',
    fontSize: 14,
  },
  arrowIcon: {
    marginRight: wp(10),
  },
  signingInfoText: {
    marginTop: hp(5),
    paddingHorizontal: wp(25),
  },
  imgCtr: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  receiptContainer: {
    paddingTop: hp(30),
    paddingBottom: hp(10),
  },
  totalAmountWrapper: {
    width: '100%',
    gap: 5,
    paddingVertical: hp(10),
    paddingHorizontal: wp(15),
  },
});
