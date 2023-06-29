import Text from 'src/components/KeeperText';
import { Box, Input, KeyboardAvoidingView, Pressable } from 'native-base';
import { Platform, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { calculateSendMaxFee, sendPhaseOne } from 'src/store/sagaActions/send_and_receive';
import { hp, windowWidth, wp } from 'src/common/data/responsiveness/responsive';

import Buttons from 'src/components/Buttons';
import Colors from 'src/theme/Colors';
import BitcoinInput from 'src/assets/images/btc_input.svg';

import HeaderTitle from 'src/components/HeaderTitle';
import { ScaledSheet } from 'react-native-size-matters';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { sendPhaseOneReset } from 'src/store/reducers/send_and_receive';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { CommonActions, useNavigation } from '@react-navigation/native';
import useToastMessage from 'src/hooks/useToastMessage';
import { TransferType } from 'src/common/data/enums/TransferType';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { BtcToSats, SATOSHIS_IN_BTC, SatsToBtc } from 'src/common/constants/Bitcoin';
import useBalance from 'src/hooks/useBalance';
import useExchangeRates from 'src/hooks/useExchangeRates';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import CurrencyKind from 'src/common/data/enums/CurrencyKind';
import { Satoshis } from 'src/common/data/typealiases/UnitAliases';
import BTCIcon from 'src/assets/images/btc_black.svg';
import { UTXO } from 'src/core/wallets/interfaces';
import config from 'src/core/config';
import { TxPriority } from 'src/core/wallets/enums';
import idx from 'idx';
import WalletSendInfo from './WalletSendInfo';

function AddSendAmount({ route }) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {
    sender,
    recipient,
    address,
    amount: prefillAmount,
    transferType,
    selectedUTXOs,
  }: {
    sender: Wallet | Vault;
    recipient: Wallet | Vault;
    address: string;
    amount: string;
    transferType: TransferType;
    selectedUTXOs: UTXO[];
  } = route.params;

  const [amount, setAmount] = useState(prefillAmount || '');
  const [amountToSend, setAmountToSend] = useState('');
  const [note, setNote] = useState('');
  const [label, setLabel] = useState('');
  const [addTagsModalVisible, setAddTagsModalVisible] = useState(false);

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
  const utxoTotal = selectedUTXOs ? SatsToBtc(selectedUTXOs.reduce((a, c) => a + c.value, 0)) : 0;
  const { getBalance, getCurrencyIcon } = useBalance();

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

  useEffect(() => {
    // sets amount to send(based on currency selection)
    if (currentCurrency === CurrencyKind.BITCOIN) {
      if (satsEnabled) setAmountToSend(amount);
      else setAmountToSend(BtcToSats(parseFloat(amount)).toString());
    } else setAmountToSend(convertFiatToSats(parseFloat(amount)).toFixed(0).toString());
  }, [currentCurrency, satsEnabled, amount]);

  useEffect(() => {
    // error handler
    let availableToSpend = idx(sender, (_) => _.specs.balances.confirmed);
    const haveSelectedUTXOs = selectedUTXOs && selectedUTXOs.length;
    if (haveSelectedUTXOs) availableToSpend = selectedUTXOs.reduce((a, c) => a + c.value, 0);

    if (haveSelectedUTXOs) {
      if (availableToSpend < Number(amountToSend))
        setErrorMessage('Please select enough UTXOs to send');
      else if (availableToSpend < Number(amountToSend) + Number(SatsToBtc(minimumAvgFeeRequired)))
        setErrorMessage('Please select enough UTXOs to accommodate fee');
      else setErrorMessage('');
    } else if (availableToSpend < Number(amountToSend))
      setErrorMessage('Amount entered is more than available to spend');
    else setErrorMessage('');
  }, [amountToSend, selectedUTXOs]);

  useEffect(() => {
    // send max handler
    if (!sendMaxFee) return;

    let availableToSpend = idx(sender, (_) => _.specs.balances.confirmed);
    const haveSelectedUTXOs = selectedUTXOs && selectedUTXOs.length;
    if (haveSelectedUTXOs) availableToSpend = selectedUTXOs.reduce((a, c) => a + c.value, 0);

    if (availableToSpend) {
      const sendMaxBalance = Math.max(availableToSpend - sendMaxFee, 0);
      if (currentCurrency === CurrencyKind.BITCOIN) {
        if (satsEnabled) setAmount(sendMaxBalance.toString());
        else setAmount(`${SatsToBtc(sendMaxBalance)}`);
      } else setAmount(convertSatsToFiat(sendMaxBalance).toString());
    }
  }, [sendMaxFee, selectedUTXOs]);

  const navigateToNext = () => {
    navigation.dispatch(
      CommonActions.navigate('SendConfirmation', {
        sender,
        recipient,
        address,
        amount: parseInt(amountToSend, 10),
        transferType,
        note,
        label,
      })
    );
  };
  const { showToast } = useToastMessage();

  const executeSendPhaseOne = () => {
    const recipients = [];
    if (!amountToSend) {
      showToast('Please enter a valid amount');
      return;
    }
    recipients.push({
      address,
      amount: amountToSend, // should be denominated in sats
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
      if (sendPhaseOneState.failedErrorMessage === 'Insufficient balance')
        showToast('You have insufficient balance at this time.', null, 1000);
      else showToast(sendPhaseOneState.failedErrorMessage, null, 1000);
    }
  }, [sendPhaseOneState]);
  useEffect(
    () => () => {
      dispatch(sendPhaseOneReset());
    },
    []
  );
  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        enabled
        keyboardVerticalOffset={Platform.select({ ios: 0, android: 500 })}
        style={styles.Container}
      >
        <HeaderTitle
          title={
            transferType === TransferType.WALLET_TO_WALLET
              ? `Sending to Wallet`
              : `Enter the Amount`
          }
          paddingLeft={25}
        />
        <Box
          style={{
            marginVertical: hp(5),
          }}
        >
          <WalletSendInfo
            selectedUTXOs={selectedUTXOs}
            availableAmt={getBalance(sender?.specs.balances.confirmed)}
            walletName={sender?.presentationData.name}
            currencyIcon={getCurrencyIcon(BTCIcon, 'dark')}
            isSats={satsEnabled}
          />
        </Box>

        <ScrollView style={styles.Container} showsVerticalScrollIndicator={false}>
          <Box
            style={{
              paddingHorizontal: 10,
            }}
          >
            {errorMessage && (
              <Text
                color="light.indicator"
                style={{
                  fontSize: 10,
                  letterSpacing: 0.1,
                  fontStyle: 'italic',
                  textAlign: 'right',
                  marginRight: 10,
                }}
              >
                {errorMessage}
              </Text>
            )}
            <Box
              backgroundColor="light.primaryBackground"
              borderColor={errorMessage ? 'light.indicator' : 'transparent'}
              style={styles.inputWrapper}
            >
              <Box flexDirection="row" alignItems="center" style={{ width: '70%' }}>
                <Box marginRight={2}>{getCurrencyIcon(BitcoinInput, 'dark')}</Box>
                <Box
                  marginLeft={2}
                  width={0.5}
                  backgroundColor="light.divider"
                  opacity={0.3}
                  height={7}
                />
                <Input
                  placeholder="Enter Amount"
                  placeholderTextColor="light.greenText"
                  width="90%"
                  fontSize={14}
                  fontWeight={300}
                  opacity={amount ? 1 : 0.5}
                  color="light.greenText"
                  letterSpacing={1.04}
                  borderWidth="0"
                  value={amount}
                  onChangeText={(value) => {
                    if (!isNaN(Number(value))) {
                      setAmount(
                        value
                          .split('.')
                          .map((el, i) => (i ? el.split('').join('') : el))
                          .join('.')
                      );
                    }
                  }}
                  keyboardType="decimal-pad"
                />
              </Box>
              <Pressable
                onPress={() => {
                  const confirmBalance = sender.specs.balances.confirmed;
                  if (confirmBalance)
                    dispatch(
                      calculateSendMaxFee({
                        numberOfRecipients: recipientCount,
                        wallet: sender,
                        selectedUTXOs,
                      })
                    );
                }}
                backgroundColor="light.accent"
                style={styles.sendMaxWrapper}
              >
                <Text color="light.sendMax" style={styles.sendMaxText}>
                  Send Max
                </Text>
              </Pressable>
            </Box>

            <Box
              backgroundColor="light.primaryBackground"
              borderColor={errorMessage ? 'light.indicator' : 'transparent'}
              style={styles.inputWrapper}
            >
              <Input
                placeholder="Add a note"
                autoCapitalize="sentences"
                placeholderTextColor="light.greenText"
                color="light.greenText"
                opacity={note ? 1 : 0.5}
                width="90%"
                fontSize={14}
                fontWeight={300}
                letterSpacing={1.04}
                borderWidth="0"
                value={note}
                onChangeText={(value) => {
                  setNote(value);
                }}
              />
            </Box>

            {/* <MenuItemButton
              // onPress={() => navigation.navigate('UTXOLabeling', { utxo: {}, wallet: sender })}
              onPress={() => showToast('Comming soon')}
              icon={<TagsGreen />}
              title="Add Tags"
              subTitle="Tags help you remember and identify UTXOs"
            /> */}
            <Box
              backgroundColor="light.primaryBackground"
              borderColor={errorMessage ? 'light.indicator' : 'transparent'}
              style={styles.inputWrapper}
            >
              <Input
                autoCapitalize="sentences"
                placeholder="Add a label"
                placeholderTextColor="light.greenText"
                opacity={label ? 1 : 0.5}
                width="90%"
                fontSize={14}
                fontWeight={300}
                letterSpacing={1.04}
                borderWidth="0"
                value={label}
                onChangeText={(value) => {
                  setLabel(value);
                }}
              />
            </Box>
            <Box style={styles.ctaBtnWrapper}>
              <Box ml={windowWidth * -0.09}>
                <Buttons
                  secondaryText="Cancel"
                  secondaryCallback={() => {
                    navigation.goBack();
                  }}
                  secondaryDisable={Boolean(!amount || errorMessage)}
                  primaryText="Send"
                  primaryDisable={Boolean(!amount || errorMessage)}
                  primaryCallback={executeSendPhaseOne}
                />
              </Box>
            </Box>
          </Box>
        </ScrollView>
        {/* <Box style={styles.infoNoteWrapper}>
          <Text style={styles.infoNoteText}>
            <Text style={styles.infoText}>Info : </Text>Contact labels help to keep your future
            activity private and organised. The information is not shared with anyone
          </Text>
        </Box> */}
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
  },
  textInput: {
    width: '100%',
    backgroundColor: Colors.Isabelline,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    padding: 20,
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  transWrapper: {
    marginVertical: hp(5),
  },
  transBorderWrapper: {
    alignItems: 'center',
    marginVertical: hp(20),
  },
  transborderView: {
    borderBottomWidth: 1,
    width: wp(280),
    opacity: 0.1,
  },
  inputWrapper: {
    marginVertical: hp(5),
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
  },
  sendMaxWrapper: {
    paddingHorizontal: hp(10),
    paddingVertical: hp(3),
    borderRadius: 5,
  },
  sendMaxText: {
    fontSize: 12,
    letterSpacing: 0.6,
  },
  addNoteWrapper: {
    flexDirection: 'row',
    marginVertical: hp(2),
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaBtnWrapper: {
    marginTop: hp(10),
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  appNumPadWrapper: {
    width: '110%',
    marginLeft: '-5%',
  },
  infoNoteWrapper: {
    position: 'absolute',
    bottom: hp(20),
    alignSelf: 'center',
    backgroundColor: Colors.Bisque,
    opacity: 0.8,
    paddingHorizontal: 10,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  infoNoteText: {
    fontSize: 12,
    fontWeight: '300',
    opacity: 1,
  },
  infoText: {
    color: Colors.Black,
    fontWeight: 'bold',
    opacity: 1,
  },
});
export default AddSendAmount;
