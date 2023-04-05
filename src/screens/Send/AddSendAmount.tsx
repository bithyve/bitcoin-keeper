import Text from 'src/components/KeeperText';
import { Box, Input, Pressable } from 'native-base';
import { TextInput } from 'react-native';
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
import {
  BtcToSats,
  getAmt,
  getCurrencyImageByRegion,
  SATOSHIS_IN_BTC,
  SatsToBtc,
} from 'src/common/constants/Bitcoin';
import useExchangeRates from 'src/hooks/useExchangeRates';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import CurrencyKind from 'src/common/data/enums/CurrencyKind';
import { Satoshis } from 'src/common/data/typealiases/UnitAliases';
import BTCIcon from 'src/assets/images/btc_black.svg';
import { UTXO } from 'src/core/wallets/interfaces';
import config from 'src/core/config';
import { TxPriority } from 'src/core/wallets/enums';
import MenuItemButton from 'src/components/CustomButton/MenuItemButton';
import TagsGreen from 'src/assets/images/tags.svg';
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
    const confirmBalance = sender.specs.balances.confirmed;
    const sendMaxBalance = confirmBalance - sendMaxFee;

    if (Number(amount) > SatsToBtc(sendMaxBalance)) {
      setErrorMessage('Amount entered is more than available to spend');
    } else {
      setErrorMessage('');
    }
    if (currentCurrency === CurrencyKind.BITCOIN) {
      setAmountToSend(BtcToSats(parseFloat(amount)));
    } else {
      setAmountToSend(convertFiatToSats(parseFloat(amount)).toFixed(0).toString());
    }
    if (selectedUTXOs && selectedUTXOs.length) {
      if (
        Number(utxoTotal) > Number(amount) &&
        Number(utxoTotal) < Number(amount) + Number(SatsToBtc(minimumAvgFeeRequired))
      ) {
        setErrorMessage('Please select enough UTXOs to accommodate fee');
      }
      if (Number(utxoTotal) < Number(amount)) {
        setErrorMessage('Please select enough UTXOs to send');
      }
    }
  }, [amount]);

  useEffect(() => {
    const confirmBalance = sender.specs.balances.confirmed;
    if (sendMaxFee && confirmBalance) {
      const sendMaxBalance = confirmBalance - sendMaxFee;
      if (currentCurrency === CurrencyKind.BITCOIN) {
        setAmount(`${SatsToBtc(sendMaxBalance)}`);
      } else {
        setAmount(convertSatsToFiat(sendMaxBalance).toString());
      }
    }
  }, [sendMaxFee]);

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
      name: recipient.presentationData.name,
    });
    dispatch(
      sendPhaseOne({
        wallet: sender,
        recipients,
        UTXOs: selectedUTXOs,
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
      <HeaderTitle
        title={
          transferType === TransferType.WALLET_TO_WALLET ? `Sending to Wallet` : `Enter the Amount`
        }
      />
      <Box
        style={{
          marginVertical: hp(5),
        }}
      >
        <WalletSendInfo
          selectedUTXOs={selectedUTXOs}
          availableAmt={getAmt(
            sender?.specs.balances.confirmed,
            exchangeRates,
            currencyCode,
            currentCurrency,
            satsEnabled
          )}
          walletName={sender?.presentationData.name}
          currencyIcon={getCurrencyImageByRegion(currencyCode, 'dark', currentCurrency, BTCIcon)}
          isSats={satsEnabled}
        />
      </Box>

      <Box
        alignItems="center"
        style={{
          marginVertical: hp(10),
        }}
      />

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
            <Box marginRight={2}>
              {getCurrencyImageByRegion(currencyCode, 'dark', currentCurrency, BitcoinInput)}
            </Box>
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
              color="light.greenText"
              opacity={0.5}
              width="90%"
              fontSize={14}
              fontWeight={300}
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
                  calculateSendMaxFee({ numberOfRecipients: recipientCount, wallet: sender })
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

        <Box style={styles.addNoteWrapper}>
          <TextInput
            autoCapitalize="sentences"
            placeholder="Add a note"
            placeholderTextColor="light.greenText"
            style={styles.textInput}
            value={note}
            onChangeText={(value) => {
              setNote(value);
            }}
          />
        </Box>
        <Box style={styles.addNoteWrapper}>
          {/* <MenuItemButton
            // onPress={() => navigation.navigate('UTXOLabeling', { utxo: {}, wallet: sender })}
            onPress={() => showToast('Comming soon')}
            icon={<TagsGreen />}
            title="Add Tags"
            subTitle="Tags help you remember and identify UTXOs"
          /> */}
          <TextInput
            autoCapitalize="sentences"
            placeholder="Add a lable"
            placeholderTextColor="light.greenText"
            style={styles.textInput}
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
      <Box style={styles.infoNoteWrapper}>
        <Text style={styles.infoNoteText}>
          <Text style={styles.infoText}>Info : </Text>Contact labels help to keep your future
          activity private and organised. The information is not shared with anyone
        </Text>
      </Box>
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
    marginBottom: hp(5),
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
