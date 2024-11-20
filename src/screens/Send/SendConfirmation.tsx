import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import Share from 'react-native-share';
import { sendPhaseTwo } from 'src/store/sagaActions/send_and_receive';
import { hp, wp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import KeeperHeader from 'src/components/KeeperHeader';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { NetworkType, TxPriority } from 'src/services/wallets/enums';
import { Signer, Vault } from 'src/services/wallets/interfaces/vault';
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
import CustomPriorityModal from './CustomPriorityModal';
import FeeInsights from 'src/screens/FeeInsights/FeeInsightsContent';
import useOneDayInsight from 'src/hooks/useOneDayInsight';
import * as Sentry from '@sentry/react-native';
import { errorBourndaryOptions } from 'src/screens/ErrorHandler';
import InvalidUTXO from 'src/assets/images/invalidUTXO.svg';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ShareGreen from 'src/assets/images/share-arrow-green.svg';
import ShareWhite from 'src/assets/images/share-arrow-white.svg';
import { resetVaultMigration } from 'src/store/reducers/vaults';
import { MANAGEWALLETS, VAULTSETTINGS, WALLETSETTINGS } from 'src/navigation/contants';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import idx from 'idx';
import { cachedTxSnapshot, dropTransactionSnapshot } from 'src/store/reducers/cachedTxn';
import ReceiptWrapper from './ReceiptWrapper';
import TransferCard from './TransferCard';
import TransactionPriorityDetails from './TransactionPriorityDetails';
import HighFeeAlert from './HighFeeAlert';
import FeeRateStatementCard from '../FeeInsights/FeeRateStatementCard';
import AmountDetails from './AmountDetails';
import SendSuccessfulContent from './SendSuccessfulContent';
import config from 'src/utils/service-utilities/config';
import AmountChangedWarningIllustration from 'src/assets/images/amount-changed-warning-illustration.svg';
import PriorityModal from './PriorityModal';

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
}

export interface tnxDetailsProps {
  transactionPriority: string;
  txFeeInfo: any;
}

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
      if (navigation.getState().index > 2 && isCachedTransaction) {
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
        setTimeout(() => {
          dispatch(sendPhaseTwoReset());
          dispatch(
            sendPhaseTwo({
              wallet: sender,
              txnPriority: transactionPriority,
              note,
              label,
              transferType,
            })
          );
        }, 200);
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

    const currentUTXOSet =
      currentSender.networkType === NetworkType.MAINNET
        ? confirmedUTXOs
        : [...confirmedUTXOs, ...unconfirmedUTXOs];

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
        routes: [{ name: 'Home' }, { name: 'VaultDetails', params: { vaultId: sender?.id } }],
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
          sender: sender,
          sendConfirmationRouteParams: route.params,
          tnxDetails: {
            txFeeInfo,
            transactionPriority,
          },
        })
      );
      setProgress(false);
    }
  }, [serializedPSBTEnvelops, inProgress]);

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
        url: url,
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
            SecondaryIcon={isDarkMode ? ShareWhite : ShareGreen}
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
            alignContent={'center'}
            justifyContent={'center'}
            justifyItems={'center'}
            width={'100%'}
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
      {/*Fee insight Modal */}
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
        buttonText={'Discard'}
        buttonCallback={discardCachedTransaction}
        buttonTextColor={`${colorMode}.buttonText`}
        secondaryButtonText={'Cancel'}
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
                setTransactionPriority(TxPriority.LOW);
              }
            }
          }}
          existingCustomPriorityFee={customFeePerByte}
        />
      )}
    </ScreenWrapper>
  );
}
export default Sentry.withErrorBoundary(SendConfirmation, errorBourndaryOptions);

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
