import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import { sendPhaseTwo } from 'src/store/sagaActions/send_and_receive';
import { hp, wp } from 'src/constants/responsive';
import Share from 'react-native-share';
import Buttons from 'src/components/Buttons';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ScreenWrapper from 'src/components/ScreenWrapper';
import {
  EntityKind,
  MultisigScriptType,
  NetworkType,
  TxPriority,
} from 'src/services/wallets/enums';
import { MiniscriptTxSelectedSatisfier, Vault } from 'src/services/wallets/interfaces/vault';
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
import ReceiptWrapper from './ReceiptWrapper';
import TransferCard from './TransferCard';
import TransactionPriorityDetails from './TransactionPriorityDetails';
import HighFeeAlert from './HighFeeAlert';
import FeeRateStatementCard from '../FeeInsights/FeeRateStatementCard';
import AmountDetails from './AmountDetails';
import SendSuccessfulContent from './SendSuccessfulContent';
import PriorityModal from './PriorityModal';
import CustomPriorityModal from './CustomPriorityModal';
import { SentryErrorBoundary } from 'src/services/sentry';
import { Path, Phase } from 'src/services/wallets/operations/miniscript/policy-generator';
import { credsAuthenticated } from 'src/store/reducers/login';
import WalletHeader from 'src/components/WalletHeader';
import WalletUtilities from 'src/services/wallets/operations/utils';

const vaultTransfers = [TransferType.WALLET_TO_VAULT];
const walletTransfers = [TransferType.VAULT_TO_WALLET, TransferType.WALLET_TO_WALLET];
const internalTransfers = [TransferType.VAULT_TO_VAULT];

export interface SendConfirmationRouteParams {
  sender: Wallet | Vault;
  internalRecipients: (Wallet | Vault)[];
  addresses: string[];
  amounts: number[];
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
  miniscriptSelectedSatisfier?: MiniscriptTxSelectedSatisfier;
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

function SendConfirmation({ route }) {
  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();
  const dispatch = useDispatch();
  const {
    sender,
    internalRecipients,
    addresses,
    amounts: originalAmounts,
    walletId,
    transferType,
    uaiSetActionFalse,
    note,
    label = [], // TODO: Need to refactor or delete
    selectedUTXOs,
    parentScreen,
    transactionPriority: initialTransactionPriority,
    customFeePerByte: initialCustomFeePerByte,
    miniscriptSelectedSatisfier,
  }: SendConfirmationRouteParams = route.params;
  const navigation = useNavigation();

  const txFeeInfo = useAppSelector((state) => state.sendAndReceive.transactionFeeInfo);
  const txRecipientsOptions = useAppSelector(
    (state) => state.sendAndReceive.sendPhaseOne?.outputs?.txRecipients
  );
  const customTxRecipientsOptions = useAppSelector(
    (state) => state.sendAndReceive.customPrioritySendPhaseOne?.outputs?.customTxRecipients
  );
  const sendMaxFee = useAppSelector((state) => state.sendAndReceive.sendMaxFee);

  const averageTxFees = useAppSelector((state) => state.network.averageTxFees);
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

  const [amounts, setAmounts] = useState(
    isCachedTransaction
      ? originalAmounts
      : (
          txRecipientsOptions?.[transactionPriority] ||
          customTxRecipientsOptions?.[transactionPriority]
        )?.map((recipient) => recipient.amount)
  );

  const [customEstBlocks, setCustomEstBlocks] = useState(0);
  const [estimationSign, setEstimationSign] = useState('≈');

  useEffect(() => {
    if (!isCachedTransaction) {
      setAmounts(
        (
          txRecipientsOptions?.[transactionPriority] ||
          customTxRecipientsOptions?.[transactionPriority]
        )?.map((recipient) => recipient.amount)
      );
    }
  }, [txRecipientsOptions, customTxRecipientsOptions, transactionPriority]);

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
    if (selectedFee > amounts.reduce((sum, amount) => sum + amount, 0) / 10) hasHighFee = true; // if fee is greater than 10% of the total amount being sent

    setFeePercentage(
      Math.trunc((selectedFee / amounts.reduce((sum, amount) => sum + amount, 0)) * 100)
    );

    if (hasHighFee) {
      setIsFeeHigh(true);
      setHighFeeAlertVisible(true);
    } else setHighFeeAlertVisible(false);

    if (
      !isCachedTransaction &&
      JSON.stringify(originalAmounts) !==
        JSON.stringify(
          (
            txRecipientsOptions?.[transactionPriority] ||
            customTxRecipientsOptions?.[transactionPriority]
          )?.map((recipient) => recipient.amount)
        )
    ) {
      setAmountChangedAlertVisible(true);
    }
  }, [transactionPriority, amounts]);

  const [inProgress, setProgress] = useState(false);

  const onProceed = () => {
    setProgress(true);
  };

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
          if (!miniscriptSelectedSatisfier) {
            showToast('Invalid phase/path selection', <ToastErrorIcon />);
            return;
          }
        }

        WalletUtilities.fetchCurrentBlockHeight()
          .then(({ currentBlockHeight }) => {
            setTimeout(() => {
              dispatch(sendPhaseTwoReset());
              dispatch(
                sendPhaseTwo({
                  wallet: sender,
                  currentBlockHeight,
                  txnPriority: transactionPriority,
                  miniscriptTxElements: {
                    selectedPhase: miniscriptSelectedSatisfier?.selectedPhase.id,
                    selectedPaths: miniscriptSelectedSatisfier?.selectedPaths.map(
                      (path) => path.id
                    ),
                  },
                  note,
                  label,
                  transferType,
                })
              );
            }, 200);
          })
          .catch(() =>
            showToast(
              'Failed to fetch current block height. Please check your internet connection and retry.',
              <ToastErrorIcon />
            )
          );
      }
    }
  }, [inProgress]);

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
            selectedPhase: miniscriptSelectedSatisfier?.selectedPhase.id,
            selectedPaths: miniscriptSelectedSatisfier?.selectedPaths.map((path) => path.id),
          },
          tnxDetails: {
            txFeeInfo,
            transactionPriority,
          },
          amounts,
          addresses,
          internalRecipients,
        })
      );
      setProgress(false);
    }
  }, [serializedPSBTEnvelops, miniscriptSelectedSatisfier, inProgress]);

  useEffect(
    () => () => {
      dispatch(resetVaultMigration());
    },
    []
  );

  const viewDetails = () => {
    setVisibleModal(false);
    if (vaultTransfers.includes(transferType) && internalRecipients.length > 0) {
      const navigationState = {
        index: 1,
        routes: [
          { name: 'Home' },
          {
            name: 'VaultDetails',
            params: {
              transactionToast: true,
              autoRefresh: true,
              vaultId: internalRecipients[0].id,
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
            params: {
              autoRefresh: true,
              hardRefresh: false,
              walletId: sender?.id,
              transactionToast: true,
            },
          },
        ],
      };
      navigation.dispatch(CommonActions.reset(navigationState));
    }
  };

  const viewManageWallets = () => {
    new Promise((resolve, reject) => {
      try {
        const result = dispatch(refreshWallets([sender], { hardRefresh: false }));
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
      <WalletHeader title="Send Confirmation" rightComponent={<CurrencyTypeSwitch />} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Box style={styles.receiptContainer}>
          <ReceiptWrapper>
            <TransferCard
              title="Sending from"
              titleFontSize={16}
              titleFontWeight={500}
              subTitle={sender?.presentationData?.name}
              subTitleFontSize={15}
              amountFontSize={16}
              unitFontSize={13}
            />
            {amounts.flatMap((amount, index) => [
              <TransferCard
                key={`to-${index}`}
                title="Sending to"
                titleFontSize={16}
                titleFontWeight={500}
                subTitle={internalRecipients[index]?.presentationData?.name || addresses[index]}
                subTitleFontSize={15}
                amount={amount}
              />,
            ])}
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
            amount={amounts.reduce((sum, amount) => sum + amount, 0)}
            amountFontSize={16}
            unitFontSize={14}
          />
          <AmountDetails
            title={walletTranslations.networkFee}
            titleFontSize={16}
            amount={txFeeInfo[transactionPriority?.toLowerCase()]?.amount}
            amountFontSize={16}
            unitFontSize={14}
          />
          <Box style={styles.horizontalLineStyle} borderBottomColor={`${colorMode}.Border`} />
          <AmountDetails
            title={walletTranslations.total}
            titleFontSize={16}
            amount={
              txFeeInfo[transactionPriority?.toLowerCase()]?.amount +
              amounts.reduce((sum, amount) => sum + amount, 0)
            }
            amountFontSize={18}
            unitFontSize={14}
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
        primaryCallback={() => {
          dispatch(credsAuthenticated(false));
          setConfirmPassVisible(true);
        }}
        primaryLoading={inProgress}
      />
      <KeeperModal
        visible={visibleModal}
        close={!isMoveAllFunds ? viewDetails : viewManageWallets}
        title={walletTranslations.SendSuccess}
        subTitle={walletTranslations.transactionBroadcasted}
        DarkCloseIcon={colorMode === 'dark'}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.modalHeaderTitle`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => (
          <SendSuccessfulContent
            transactionPriority={transactionPriority}
            amounts={amounts || [sourceWalletAmount]}
            sender={sender || sourceWallet}
            recipients={internalRecipients || [defaultVault]}
            addresses={addresses}
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
        visible={confirmPassVisible}
        close={() => setConfirmPassVisible(false)}
        title={walletTranslations.confirmPassTitle}
        subTitleWidth={wp(240)}
        subTitle=""
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.modalHeaderTitle`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
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
        textColor={`${colorMode}.modalHeaderTitle`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
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
            amountToSend={amounts.reduce((sum, amount) => sum + amount, 0)}
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
        textColor={`${colorMode}.modalHeaderTitle`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
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
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.modalHeaderTitle`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
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
          recipients={addresses.map((address, index) => ({
            address,
            amount: originalAmounts[index],
          }))}
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
          miniscriptSelectedSatisfier={miniscriptSelectedSatisfier}
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
    marginTop: hp(5),
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
  optionTitle: {
    marginBottom: hp(5),
  },
  optionIconCtr: {
    height: hp(39),
    width: wp(39),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
  optionCTR: {
    flexDirection: 'row',
    paddingHorizontal: wp(15),
    paddingVertical: hp(22),
    alignItems: 'center',
    gap: wp(16),
    borderRadius: 12,
    borderWidth: 1,
  },
});
