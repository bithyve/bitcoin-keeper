import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { calculateSendMaxFee, sendPhaseOne } from 'src/store/sagaActions/send_and_receive';
import { hp, wp } from 'src/constants/responsive';

import Buttons from 'src/components/Buttons';
import Colors from 'src/theme/Colors';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { sendPhaseOneReset } from 'src/store/reducers/send_and_receive';
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
import WalletIcon from 'src/assets/images/daily_wallet.svg';
import VaultIcon from 'src/assets/images/vault_icon.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import AddressIcon from 'src/components/AddressIcon';
import { UTXO } from 'src/services/wallets/interfaces';
import config from 'src/utils/service-utilities/config';
import { EntityKind, NetworkType, TxPriority, VaultType } from 'src/services/wallets/enums';
import idx from 'idx';
import useLabelsNew from 'src/hooks/useLabelsNew';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import HexagonIcon from 'src/components/HexagonIcon';
import CurrencyInfo from '../Home/components/CurrencyInfo';
import { MANAGEWALLETS, VAULTSETTINGS, WALLETSETTINGS } from 'src/navigation/contants';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import AmountDetailsInput from './AmountDetailsInput';

function AddSendAmount({ route }) {
  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslation, common } = translations;
  const {
    sender,
    recipient,
    address,
    amount: prefillAmount,
    note,
    transferType,
    selectedUTXOs = [],
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
  const recipientCount = 1;
  const sendMaxFee = useAppSelector((state) => state.sendAndReceive.sendMaxFee);
  const sendPhaseOneState = useAppSelector((state) => state.sendAndReceive.sendPhaseOne);
  const { averageTxFees } = useAppSelector((state) => state.network);
  const exchangeRates = useExchangeRates();
  const currencyCode = useCurrencyCode();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  const { satsEnabled } = useAppSelector((state) => state.settings);
  const minimumAvgFeeRequired = averageTxFees[config.NETWORK_TYPE][TxPriority.LOW].averageTxFee;
  const { getConvertedBalance } = useBalance();
  const { labels } = useLabelsNew({ wallet: sender, utxos: selectedUTXOs });
  const isAddress =
    transferType === TransferType.VAULT_TO_ADDRESS ||
    transferType === TransferType.WALLET_TO_ADDRESS;
  const isMoveAllFunds =
    parentScreen === MANAGEWALLETS ||
    parentScreen === VAULTSETTINGS ||
    parentScreen === WALLETSETTINGS;
  const availableBalance =
    sender.networkType === NetworkType.MAINNET
      ? sender.specs.balances.confirmed
      : sender.specs.balances.confirmed + sender.specs.balances.unconfirmed;

  const isDarkMode = colorMode === 'dark';
  const [localCurrencyKind, setLocalCurrencyKind] = useState(currentCurrency);
  const [maxAmountToSend, setMaxAmountToSend] = useState(null);

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
      if (currentCurrency === CurrencyKind.BITCOIN) {
        if (satsEnabled) {
          setAmountToSend(amount);
        } else {
          const btcAmount = parseFloat(amount).toFixed(8);
          setAmountToSend(btcAmount);
        }
      } else {
        const satsAmount = convertFiatToSats(parseFloat(amount)).toFixed(0)?.toString();
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
    // error handler
    const balance = idx(sender, (_) => _.specs.balances);
    let availableToSpend =
      sender.networkType === NetworkType.MAINNET
        ? balance.confirmed
        : balance.confirmed + balance.unconfirmed;

    const haveSelectedUTXOs = selectedUTXOs && selectedUTXOs.length;
    if (haveSelectedUTXOs) availableToSpend = selectedUTXOs.reduce((a, c) => a + c.value, 0);

    if (haveSelectedUTXOs) {
      if (availableToSpend < Number(amountToSend)) {
        setErrorMessage('Please select enough UTXOs to send');
      } else if (
        availableToSpend <
        Number(amountToSend) + Number(SatsToBtc(minimumAvgFeeRequired))
      ) {
        setErrorMessage('Please select enough UTXOs to accommodate fee');
      } else setErrorMessage('');
    } else if (availableToSpend < Number(amountToSend)) {
      setErrorMessage('Amount entered is more than available to spend');
    } else setErrorMessage('');
  }, [amountToSend, selectedUTXOs.length]);

  useEffect(() => {
    onSendMax(sendMaxFee, selectedUTXOs.length);
  }, [sendMaxFee, selectedUTXOs.length]);

  useEffect(() => {
    console.log(isSendMax);
    if (isSendMax) handleSendMax();
  }, []);

  useEffect(() => {
    if (isMoveAllFunds) {
      if (sendMaxFee) {
        onSendMax(sendMaxFee, selectedUTXOs);
      } else {
        dispatch(
          calculateSendMaxFee({
            numberOfRecipients: recipientCount,
            wallet: sender,
            selectedUTXOs,
          })
        );
      }
    }
  }, [isMoveAllFunds, sendMaxFee, selectedUTXOs]);

  useEffect(() => {
    if (!currentAmount) {
      setAmountToSend('');
      return;
    }

    const satsAmount = convertToSats(currentAmount, localCurrencyKind);
    setAmountToSend(satsAmount);
  }, [currentAmount, localCurrencyKind]);

  const onSendMax = (sendMaxFee, selectedUTXOs) => {
    if (!sendMaxFee) return;

    const balance = idx(sender, (_) => _.specs.balances);
    let availableToSpend =
      sender.networkType === NetworkType.MAINNET
        ? balance.confirmed
        : balance.confirmed + balance.unconfirmed;

    const haveSelectedUTXOs = selectedUTXOs && selectedUTXOs.length;
    if (haveSelectedUTXOs) availableToSpend = selectedUTXOs.reduce((a, c) => a + c.value, 0);

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

  const navigateToNext = () => {
    navigation.dispatch(
      CommonActions.navigate('SendConfirmation', {
        sender,
        recipient,
        address,
        amount: parseInt(amountToSend, 10), // in sats
        transferType,
        note,
        selectedUTXOs,
        parentScreen,
        label: labelsToAdd.filter(
          (item) => !(item.name === idx(recipient, (_) => _.presentationData.name) && item.isSystem) // remove wallet labels are they are internal refrerences
        ),
        date: new Date(),
      })
    );
  };

  const handleSendMax = () => {
    if (availableBalance) {
      if (sendMaxFee) {
        onSendMax(sendMaxFee, selectedUTXOs);
        return;
      }
      dispatch(
        calculateSendMaxFee({
          numberOfRecipients: recipientCount,
          wallet: sender,
          selectedUTXOs,
        })
      );
    }
  };

  const executeSendPhaseOne = () => {
    const recipients = [];
    if (!amountToSend) {
      showToast('Please enter a valid amount');
      return;
    }
    const amountInSats = convertToSats(currentAmount, localCurrencyKind);
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
      setAmount(currentAmount + '.');
      return;
    }
    const maxDecimalPlaces = localCurrencyKind === CurrencyKind.BITCOIN && !satsEnabled ? 8 : 2;
    if (currentAmount === '0' && text !== '.') {
      setAmount(text);
      return;
    }
    let newAmount = currentAmount + text;
    const parts = newAmount.split('.');
    if (parts[1] && parts[1].length > maxDecimalPlaces) {
      return;
    }
    setAmount(newAmount);
  };

  const onDeletePressed = () => {
    setMaxAmountToSend(null);

    if (currentAmount.length <= 1) {
      setAmount('0');
      return;
    }
    setAmount(currentAmount.slice(0, currentAmount.length - 1));
  };

  const getWalletIcon = (wallet) => {
    if (wallet?.entityKind === EntityKind.VAULT) {
      return wallet.type === VaultType.COLLABORATIVE ? <CollaborativeIcon /> : <VaultIcon />;
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
            amount={availableBalance}
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
        handleSendMax={handleSendMax}
        localCurrencyKind={localCurrencyKind}
        setLocalCurrencyKind={setLocalCurrencyKind}
        currencyCode={currencyCode}
        specificBitcoinAmount={maxAmountToSend}
      />
      <Box style={styles.RecipientInfo}>
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
      </Box>
      <KeyPadView
        onPressNumber={onPressNumber}
        onDeletePressed={onDeletePressed}
        disabled={prefillAmount || isSendMax || isMoveAllFunds}
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
});
export default AddSendAmount;
