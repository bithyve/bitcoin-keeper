import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import {
  calculateCustomFee,
  calculateSendMaxFee,
  sendPhaseOne,
} from 'src/store/sagaActions/send_and_receive';
import { hp, wp } from 'src/constants/responsive';

import Buttons from 'src/components/Buttons';
import Colors from 'src/theme/Colors';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import {
  customPrioritySendPhaseOneStatusReset,
  sendPhaseOneReset,
} from 'src/store/reducers/send_and_receive';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { CommonActions, useNavigation } from '@react-navigation/native';
import useToastMessage from 'src/hooks/useToastMessage';
import { TransferType } from 'src/models/enums/TransferType';
import { Vault } from 'src/services/wallets/interfaces/vault';
import { BtcToSats, SATOSHIS_IN_BTC, SatsToBtc } from 'src/constants/Bitcoin';
import useBalance from 'src/hooks/useBalance';
import useExchangeRates from 'src/hooks/useExchangeRates';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import { Satoshis } from 'src/models/types/UnitAliases';
import WalletSmallIcon from 'src/assets/images/daily-wallet-small.svg';
import VaultSmallIcon from 'src/assets/images/vault-icon-small.svg';
import CollaborativeSmallIcon from 'src/assets/images/collaborative-icon-small.svg';
import DeleteDarkIcon from 'src/assets/images/delete.svg';
import DeleteIcon from 'src/assets/images/deleteLight.svg';
import CollaborativeIcon from 'src/assets/images/collaborative_vault_white.svg';
import AssistedIcon from 'src/assets/images/assisted-vault-white-icon.svg';
import WalletIcon from 'src/assets/images/daily_wallet.svg';
import VaultIcon from 'src/assets/images/vault_icon.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { UTXO } from 'src/services/wallets/interfaces';
import config from 'src/utils/service-utilities/config';
import {
  EntityKind,
  MultisigScriptType,
  NetworkType,
  TxPriority,
  VaultType,
} from 'src/services/wallets/enums';
import idx from 'idx';
import useLabelsNew from 'src/hooks/useLabelsNew';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import HexagonIcon from 'src/components/HexagonIcon';
import { MANAGEWALLETS, VAULTSETTINGS, WALLETSETTINGS } from 'src/navigation/contants';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import KeeperModal from 'src/components/KeeperModal';
import ArrowIcon from 'src/assets/images/icon_arrow.svg';
import ArrowIconWhite from 'src/assets/images/icon_arrow_white.svg';
import ReceiptIcon from 'src/assets/images/receipt.svg';
import ReceiptIconDark from 'src/assets/images/receipt-white.svg';
import WalletUtilities from 'src/services/wallets/operations/utils';
import AmountDetailsInput from './AmountDetailsInput';
import CurrencyInfo from '../Home/components/CurrencyInfo';
import CustomPriorityModal from './CustomPriorityModal';
import PriorityModal from './PriorityModal';

const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

function AddSendAmount({ route }) {
  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslations, common, vault } = translations;
  const {
    sender,
    recipient,
    address,
    amount: prefillAmount,
    note,
    transferType,
    selectedUTXOs = [],
    totalUtxosAmount,
    parentScreen,
    isSendMax = false,
  }: {
    sender: Wallet | Vault;
    recipient: Wallet | Vault;
    address: string;
    amount: string;
    note?: string;
    transferType: TransferType;
    selectedUTXOs: UTXO[];
    totalUtxosAmount: number;
    parentScreen?: string;
    isSendMax?: boolean;
  } = route.params;

  const [amount, setAmount] = useState(prefillAmount || '0');
  const [amountToSend, setAmountToSend] = useState('0');
  const [currentAmount, setCurrentAmount] = useState(amount);
  const [equivalentAmount, setEquivalentAmount] = useState<string | number>('0');
  const [lastToastTime, setLastToastTime] = useState(0);
  const [labelsToAdd, setLabelsToAdd] = useState([]);
  const [errorMessage, setErrorMessage] = useState(''); // this state will handle error
  const sendMaxFee = useAppSelector((state) => state.sendAndReceive.sendMaxFee);
  const sendPhaseOneState = useAppSelector((state) => state.sendAndReceive.sendPhaseOne);
  const { averageTxFees } = useAppSelector((state) => state.network);
  const [currentBlockHeight, setCurrentBlockHeight] = useState(null);

  const exchangeRates = useExchangeRates();
  const currencyCode = useCurrencyCode();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  const { satsEnabled } = useAppSelector((state) => state.settings);
  const { getConvertedBalance } = useBalance();
  const { labels } = useLabelsNew({ wallet: sender, utxos: selectedUTXOs });
  const isAddress =
    transferType === TransferType.VAULT_TO_ADDRESS ||
    transferType === TransferType.WALLET_TO_ADDRESS;
  const isMoveAllFunds =
    parentScreen === MANAGEWALLETS ||
    parentScreen === VAULTSETTINGS ||
    parentScreen === WALLETSETTINGS;
  const availableBalance = sender.specs.balances.confirmed + sender.specs.balances.unconfirmed;

  const isDarkMode = colorMode === 'dark';
  const [localCurrencyKind, setLocalCurrencyKind] = useState(currentCurrency);
  const [maxAmountToSend, setMaxAmountToSend] = useState(null);
  const [isSendingMax, setIsSendingMax] = useState(isSendMax);
  const [transPriorityModalVisible, setTransPriorityModalVisible] = useState(false);
  const [visibleCustomPriorityModal, setVisibleCustomPriorityModal] = useState(false);
  const [transactionPriority, setTransactionPriority] = useState(TxPriority.LOW);
  const [customFeePerByte, setCustomFeePerByte] = useState(0);
  const [customEstBlocks, setCustomEstBlocks] = useState(0);
  const [estimationSign, setEstimationSign] = useState('≈');
  const balance = idx(sender, (_) => _.specs.balances);
  let availableToSpend = balance.confirmed + balance.unconfirmed;

  const haveSelectedUTXOs = selectedUTXOs && selectedUTXOs.length;
  if (haveSelectedUTXOs) availableToSpend = selectedUTXOs.reduce((a, c) => a + c.value, 0);

  function convertFiatToSats(fiatAmount: number) {
    return exchangeRates && exchangeRates[currencyCode]
      ? (fiatAmount / exchangeRates[currencyCode].last) * SATOSHIS_IN_BTC
      : 0;
  }

  function convertSatsToFiat(amount: Satoshis) {
    return exchangeRates && exchangeRates[currencyCode]
      ? (amount / SATOSHIS_IN_BTC) * exchangeRates[currencyCode].last
      : 0;
  }

  const convertToSats = (value, fromKind) => {
    if (!value) return '0';

    try {
      if (fromKind === CurrencyKind.BITCOIN) {
        return satsEnabled ? value.toString() : BtcToSats(parseFloat(value)).toString(); // convert BTC to sats
      } else {
        return convertFiatToSats(parseFloat(value)).toFixed(0);
      }
    } catch (error) {
      console.log('Error converting to sats:', error);
      return '0';
    }
  };

  useEffect(() => {
    if (!amount) {
      setAmountToSend('');
      return;
    }

    try {
      if (localCurrencyKind === CurrencyKind.BITCOIN) {
        if (satsEnabled) {
          setAmountToSend(amount);
        } else {
          const btcAmount = (parseFloat(amount) * SATOSHIS_IN_BTC).toFixed(0);
          setAmountToSend(btcAmount);
        }
      } else {
        const satsAmount = isSendingMax
          ? satsEnabled
            ? maxAmountToSend
            : maxAmountToSend / SATOSHIS_IN_BTC
          : convertFiatToSats(parseFloat(amount)).toFixed(0)?.toString();

        setAmountToSend(satsAmount);
      }
    } catch (error) {
      console.log('Error converting amount:', error);
      setAmountToSend('');
    }
  }, [currentCurrency, satsEnabled, amount]);

  useEffect(() => {
    if (!route.params?.amount) return;
    if (currentCurrency === CurrencyKind.BITCOIN) {
      setAmount(route.params.amount);
    } else {
      const numAmount = parseFloat(route.params.amount);
      if (!isNaN(numAmount)) {
        const fiatAmount = getConvertedBalance(numAmount);
        setAmount(fiatAmount?.toString() || '');
      }
    }
  }, [currentCurrency, route.params?.amount]);

  useEffect(() => {
    if (haveSelectedUTXOs) {
      if (availableToSpend < Number(amountToSend)) {
        setErrorMessage('Please select enough UTXOs to send');
      } else if (availableToSpend < Number(amountToSend)) {
        setErrorMessage('Please select enough UTXOs to accommodate fee');
      } else setErrorMessage('');
    } else if (availableToSpend < Number(amountToSend)) {
      setErrorMessage('Amount entered is more than available to spend');
    } else setErrorMessage('');
  }, [amountToSend, selectedUTXOs.length]);

  useEffect(() => {
    if (sendMaxFee && isSendingMax) {
      onSendMax();
    }
  }, [sendMaxFee, selectedUTXOs.length]);

  useEffect(() => {
    const recipients = [];
    recipients.push({
      address,
      amount: 0,
    });
    dispatch(
      calculateSendMaxFee({
        recipients,
        wallet: sender,
        selectedUTXOs,
        feePerByte:
          transactionPriority === TxPriority.CUSTOM
            ? customFeePerByte
            : averageTxFees[config.NETWORK_TYPE][transactionPriority].feePerByte,
      })
    );
  }, [transactionPriority, customFeePerByte]);

  useEffect(() => {
    if (isSendingMax) handleSendMax();
  }, [isSendingMax]);

  useEffect(() => {
    if (isMoveAllFunds) {
      // TODO: Should just remove amount from calculateSendMaxFee
      const recipients = [];
      recipients.push({
        address,
        amount: 0,
      });
      dispatch(
        calculateSendMaxFee({
          recipients,
          wallet: sender,
          selectedUTXOs,
          feePerByte:
            transactionPriority === TxPriority.CUSTOM
              ? customFeePerByte
              : averageTxFees[config.NETWORK_TYPE][transactionPriority].feePerByte,
        })
      );
    }
  }, [isMoveAllFunds, sendMaxFee, selectedUTXOs, transactionPriority, customFeePerByte]);

  useEffect(() => {
    if (!currentAmount) {
      setAmountToSend('');
      return;
    }

    const satsAmount = isSendingMax
      ? satsEnabled
        ? maxAmountToSend
        : maxAmountToSend * SATOSHIS_IN_BTC
      : convertToSats(currentAmount, localCurrencyKind);
    setAmountToSend(satsAmount);
  }, [currentAmount, localCurrencyKind]);

  const onSendMax = () => {
    if (!sendMaxFee) return;

    if (availableToSpend) {
      const sendMaxBalance = Math.max(availableToSpend - sendMaxFee, 0);
      setMaxAmountToSend(
        satsEnabled ? Number(sendMaxBalance) : Number(sendMaxBalance) / SATOSHIS_IN_BTC
      );

      if (localCurrencyKind === CurrencyKind.BITCOIN) {
        const amountToSet = sendMaxBalance;
        if (satsEnabled) {
          setAmount(amountToSet.toFixed(0));
        } else {
          setAmount(Number(SatsToBtc(amountToSet)).toFixed(8));
        }
      } else {
        const amountToSet = Number(sendMaxBalance);
        setAmount(convertSatsToFiat(amountToSet).toFixed(2));
      }
    }
  };

  useEffect(() => {
    // should bind with a refresher in case the auto fetch for block-height fails
    if (sender.entityKind === EntityKind.VAULT) {
      if (sender.scheme.multisigScriptType === MultisigScriptType.MINISCRIPT_MULTISIG) {
        WalletUtilities.fetchCurrentBlockHeight()
          .then(({ currentBlockHeight }) => {
            setCurrentBlockHeight(currentBlockHeight);
          })
          .catch((err) => showToast(err));
      }
    }
  }, []);

  const navigateToNext = () => {
    if (sender.entityKind === EntityKind.VAULT) {
      if (sender.scheme.multisigScriptType === MultisigScriptType.MINISCRIPT_MULTISIG) {
        if (!currentBlockHeight) {
          showToast('Unable to sync current block height');
          return;
        }
      }
    }

    if (transactionPriority === TxPriority.CUSTOM) {
      const recipients = [];
      recipients.push({
        address,
        amount: parseInt(amountToSend, 10),
      });
      dispatch(
        calculateCustomFee({
          wallet: sender,
          recipients,
          feePerByte: customFeePerByte.toString(),
          customEstimatedBlocks: customEstBlocks.toString(),
          selectedUTXOs,
        })
      );
    }
    navigation.dispatch(
      CommonActions.navigate('SendConfirmation', {
        sender,
        recipient,
        address,
        amount: parseInt(amountToSend, 10), // in sats
        transferType,
        currentBlockHeight,
        note,
        selectedUTXOs,
        parentScreen,
        label: labelsToAdd.filter(
          (item) => !(item.name === idx(recipient, (_) => _.presentationData.name) && item.isSystem) // remove wallet labels are they are internal refrerences
        ),
        date: new Date(),
        transactionPriority,
        customFeePerByte,
      })
    );
  };

  const handleSendMax = () => {
    if (availableBalance) {
      const recipients = [];
      recipients.push({
        address,
        amount: 0,
      });
      dispatch(
        calculateSendMaxFee({
          recipients,
          wallet: sender,
          selectedUTXOs,
          feePerByte:
            transactionPriority === TxPriority.CUSTOM
              ? customFeePerByte
              : averageTxFees[config.NETWORK_TYPE][transactionPriority].feePerByte,
        })
      );
      onSendMax();
    }
  };

  const executeSendPhaseOne = () => {
    dispatch(sendPhaseOneReset());
    const recipients = [];
    if (!amountToSend) {
      showToast('Please enter a valid amount');
      return;
    }
    const amountInSats = isSendingMax
      ? satsEnabled
        ? maxAmountToSend
        : maxAmountToSend * SATOSHIS_IN_BTC
      : convertToSats(currentAmount, localCurrencyKind);
    recipients.push({
      address,
      amount: amountInSats,
      name: recipient ? recipient.presentationData.name : '',
    });
    dispatch(
      sendPhaseOne({
        wallet: sender,
        recipients,
        selectedUTXOs,
      })
    );
  };

  useEffect(() => {
    if (sendPhaseOneState.isSuccessful) {
      navigateToNext();
    } else if (sendPhaseOneState.hasFailed) {
      if (sendPhaseOneState.failedErrorMessage === 'Insufficient balance') {
        showToast('Insufficient balance for the amount to be sent + fees');
      } else showToast(sendPhaseOneState.failedErrorMessage);
    }
  }, [sendPhaseOneState]);
  useEffect(
    () => () => {
      dispatch(sendPhaseOneReset());
    },
    []
  );
  useEffect(() => {
    const initialLabels = [];
    selectedUTXOs.forEach((utxo) => {
      if (labels[`${utxo.txId}:${utxo.vout}`]) {
        const useLabels = labels[`${utxo.txId}:${utxo.vout}`].filter((item) => !item.isSystem);
        initialLabels.push(...useLabels);
      }
    });
    setLabelsToAdd(initialLabels);
  }, []);

  const getSmallWalletIcon = (wallet) => {
    if (wallet.entityKind === EntityKind.VAULT) {
      return wallet.type === VaultType.COLLABORATIVE ? (
        <CollaborativeSmallIcon />
      ) : (
        <VaultSmallIcon />
      );
    } else {
      return <WalletSmallIcon />;
    }
  };

  const onPressNumber = (text) => {
    if (errorMessage) {
      showDebouncedToast(errorMessage);
      return;
    }

    setMaxAmountToSend(null);
    setIsSendingMax(false);

    if (text === 'x') {
      onDeletePressed();
      return;
    }
    if (text === '.') {
      if (
        (localCurrencyKind === CurrencyKind.BITCOIN && satsEnabled) ||
        currentAmount.includes('.')
      ) {
        return;
      }
      if (!currentAmount || currentAmount === '0') {
        setAmount('0.');
        return;
      }
      setAmount(`${currentAmount}.`);
      return;
    }
    const maxDecimalPlaces = localCurrencyKind === CurrencyKind.BITCOIN && !satsEnabled ? 8 : 2;
    if (currentAmount === '0' && text !== '.') {
      setAmount(text);
      return;
    }
    const newAmount = currentAmount + text;
    const parts = newAmount.split('.');
    if (parts[1] && parts[1].length > maxDecimalPlaces) {
      return;
    }
    setAmount(newAmount);
  };

  const onDeletePressed = () => {
    setMaxAmountToSend(null);
    setIsSendingMax(false);

    if (currentAmount.length <= 1) {
      setAmount('0');
      return;
    }
    setAmount(currentAmount.slice(0, currentAmount.length - 1));
  };

  const getWalletIcon = (wallet) => {
    if (wallet?.entityKind === EntityKind.VAULT) {
      if (wallet.type === VaultType.COLLABORATIVE) {
        return <CollaborativeIcon />;
      } else if (wallet.type === VaultType.ASSISTED) {
        return <AssistedIcon />;
      } else {
        return <VaultIcon />;
      }
    } else {
      return <WalletIcon />;
    }
  };

  const showDebouncedToast = (message) => {
    const currentTime = Date.now();
    const debounceTime = 3000;

    if (currentTime - lastToastTime > debounceTime) {
      showToast(message, <ToastErrorIcon />);
      setLastToastTime(currentTime);
    }
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title="Sending from"
        subtitle={sender.presentationData.name}
        subTitleSize={16}
        icon={
          <HexagonIcon
            width={44}
            height={38}
            backgroundColor={isDarkMode ? Colors.DullGreenDark : Colors.pantoneGreen}
            icon={getWalletIcon(sender)}
          />
        }
        availableBalance={
          <CurrencyInfo
            hideAmounts={false}
            amount={selectedUTXOs?.length ? totalUtxosAmount : availableBalance}
            fontSize={16}
            satsFontSize={12}
            color={`${colorMode}.primaryText`}
            variation={!isDarkMode ? 'dark' : 'light'}
          />
        }
      />
      <AmountDetailsInput
        amount={amount}
        currentAmount={currentAmount}
        setCurrentAmount={setCurrentAmount}
        equivalentAmount={equivalentAmount}
        setEquivalentAmount={setEquivalentAmount}
        satsEnabled={satsEnabled}
        handleSendMax={() => setIsSendingMax(true)}
        localCurrencyKind={localCurrencyKind}
        setLocalCurrencyKind={setLocalCurrencyKind}
        currencyCode={currencyCode}
        specificBitcoinAmount={maxAmountToSend}
      />
      {/* <Box style={styles.RecipientInfo}>
        <HexagonIcon
          width={34}
          height={30}
          icon={isAddress ? <AddressIcon /> : getSmallWalletIcon(recipient)}
          backgroundColor={isDarkMode ? Colors.DullBrown : Colors.brownColor}
        />
        <Text color={`${colorMode}.primaryText`}>
          {isAddress ? 'Sending to address' : `Sending to ${recipient?.entityKind.toLowerCase()}`}
        </Text>
        <Text
          color={`${colorMode}.primaryText`}
          medium
          numberOfLines={isAddress ? 1 : undefined}
          ellipsizeMode="middle"
          style={styles.receipientText}
        >
          {isAddress ? address : recipient?.presentationData?.name}
        </Text>
      </Box> */}
      <TouchableOpacity onPress={() => setTransPriorityModalVisible(true)}>
        <Box
          style={[styles.dashedButton]}
          backgroundColor={`${colorMode}.newDashedButtonBackground`}
          borderColor={`${colorMode}.dashedButtonBorder`}
          borderWidth={1}
          borderStyle="dashed"
        >
          <Box style={styles.priorityItemLeft}>
            <Box flexDirection="row">
              {colorMode === 'light' ? <ReceiptIcon /> : <ReceiptIconDark />}
              <Text medium fontSize={13} style={{ marginLeft: wp(10) }}>
                Fee Priority: {capitalizeFirstLetter(transactionPriority)}
              </Text>
            </Box>
            <Box flexDirection="row">
              <Text fontSize={15}>{estimationSign}</Text>
              <Text fontSize={12} style={{ marginLeft: wp(2), marginTop: wp(3.5) }}>{` ${
                (transactionPriority === TxPriority.CUSTOM
                  ? customEstBlocks
                  : averageTxFees[config.NETWORK_TYPE][transactionPriority].estimatedBlocks ?? 0) *
                10
              } mins`}</Text>
              <Text fontSize={12} style={{ marginLeft: wp(20), marginTop: wp(3.5) }}>
                {transactionPriority === TxPriority.CUSTOM
                  ? customFeePerByte
                  : averageTxFees[config.NETWORK_TYPE][transactionPriority].feePerByte ?? 0}{' '}
                sats/vbyte
              </Text>
            </Box>
          </Box>
          {colorMode === 'light' ? <ArrowIcon height="100%" /> : <ArrowIconWhite height="100%" />}
        </Box>
      </TouchableOpacity>
      <KeyPadView
        onPressNumber={onPressNumber}
        onDeletePressed={onDeletePressed}
        disabled={prefillAmount || isMoveAllFunds}
        enableDecimal
        keyColor={`${colorMode}.keyPadText`}
        ClearIcon={colorMode === 'dark' ? <DeleteIcon /> : <DeleteDarkIcon />}
      />
      <Box style={styles.ctaBtnWrapper}>
        <Buttons
          primaryText={common.send}
          primaryDisable={Boolean(Number(amount) <= 0 || errorMessage)}
          primaryCallback={executeSendPhaseOne}
          fullWidth
        />
      </Box>
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
      {visibleCustomPriorityModal && (
        <CustomPriorityModal
          visible={visibleCustomPriorityModal}
          close={() => setVisibleCustomPriorityModal(false)}
          title={vault.CustomPriority}
          secondaryButtonText={common.Goback}
          secondaryCallback={() => setVisibleCustomPriorityModal(false)}
          subTitle="Enter amount in sats/vbyte"
          network={sender?.networkType}
          recipients={[{ address, amount: 0 }]}
          sender={sender}
          selectedUTXOs={selectedUTXOs}
          buttonCallback={(setCustomTxPriority, customFeePerByte) => {
            setVisibleCustomPriorityModal(false);
            if (setCustomTxPriority) {
              setTransactionPriority(TxPriority.CUSTOM);
              setCustomFeePerByte(Number(customFeePerByte));
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  ctaBtnWrapper: {
    marginTop: hp(30),
  },
  RecipientInfo: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: hp(15),
    paddingHorizontal: wp(15),
    alignItems: 'center',
  },
  receipientText: {
    width: '45%',
  },
  dashedButton: {
    height: hp(61),
    width: '95%',
    alignSelf: 'center',
    borderRadius: 10,
    paddingHorizontal: wp(18),
    marginBottom: hp(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityItemLeft: {
    gap: 3,
    flex: 1,
  },
});

export default AddSendAmount;
