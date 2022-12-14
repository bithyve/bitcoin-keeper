import { Box, Input, Pressable, Text } from 'native-base';
import { Keyboard, KeyboardAvoidingView, Platform, TextInput, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { calculateSendMaxFee, sendPhaseOne } from 'src/store/sagaActions/send_and_receive';
import { hp, windowHeight, windowWidth, wp } from 'src/common/data/responsiveness/responsive';

import AppNumPad from 'src/components/AppNumPad';
import Buttons from 'src/components/Buttons';
import Colors from 'src/theme/Colors';
import DollarInput from 'src/assets/images/svgs/icon_dollar.svg';
import HeaderTitle from 'src/components/HeaderTitle';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { sendPhaseOneReset } from 'src/store/reducers/send_and_receive';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import useToastMessage from 'src/hooks/useToastMessage';
import WalletDetails from './WalletDetails';
import Transactions from './Transactions';

function AddSendAmount({ route }) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {
    wallet,
    address,
    amount: prefillAmount,
    availableAmt,
    walletName,
    from,
  }: {
    wallet: Wallet;
    address: string;
    amount: string;
    availableAmt: string;
    walletName: string;
    from: string;
  } = route.params;

  const [amount, setAmount] = useState(prefillAmount || '');
  const [recipientCount, setReicipientCount] = useState(1);

  const sendMaxFee = useAppSelector((state) => state.sendAndReceive.sendMaxFee);
  const sendPhaseOneState = useAppSelector((state) => state.sendAndReceive.sendPhaseOne);

  useEffect(() => {
    const confirmBalance = wallet.specs.balances.confirmed;
    if (sendMaxFee && confirmBalance) {
      const sendMaxBalance = confirmBalance - sendMaxFee;
      setAmount(`${sendMaxBalance}`);
    }
  }, [sendMaxFee]);

  const navigateToNext = (recipients) => {
    navigation.navigate('SendConfirmation', {
      wallet,
      recipients,
    });
  };
  const { showToast } = useToastMessage();

  const executeSendPhaseOne = () => {
    const recipients = [];
    recipients.push({
      address,
      amount: amount ? parseInt(amount) : 0,
    });
    dispatch(
      sendPhaseOne({
        wallet,
        recipients,
      })
    );
  };

  useEffect(() => {
    if (sendPhaseOneState.isSuccessful) {
      const recipients = [];
      recipients.push({
        address,
        amount: amount ? parseInt(amount) : 0,
      });
      navigateToNext(recipients);
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
  console.log(windowHeight);
  return (
    <ScreenWrapper>
      <HeaderTitle
        title={from == 'Wallet' ? `Sending to Wallet` : `Enter the amount`}
        // subtitle={`Sending to ${address}`}
      />
      {/* <Box
        flexDirection={'row'}
        alignItems={'center'}
        justifyContent={'space-between'}
        marginX={8}
        marginY={windowHeight >= 850 ? '12' : windowHeight >= 750 ? '8' : '5'}
      >
        <Box flexDirection={'row'} alignItems={'center'}>
          <Box
            backgroundColor={'light.yellow1'}
            height={10}
            width={10}
            borderRadius={20}
            justifyContent={'center'}
            alignItems={'center'}
          >
            <Text
              color={'light.greenText'}
              fontSize={20}
              letterSpacing={1.12}
              fontWeight={'extrabold'}
            >
              @
            </Text>
          </Box>
          <Text
            color={'light.greenText'}
            fontSize={14}
            letterSpacing={1.12}
            fontWeight={300}
            marginX={5}
          >
            {address}
          </Text>
        </Box>
        <DollarInput />
      </Box> */}
      {/* { Transaction list} */}
      <Box style={styles.transWrapper}>
        <WalletDetails availableAmt={availableAmt} walletName={walletName} />
      </Box>
      <Box
      // style={{
      //   marginTop: hp(32),
      //   marginBottom: hp(32),
      // }}
      >
        {/* <Transactions
            transactions={[
              {
                address,
                amount,
              },
            ]}
            addTransaction={() => {}}
          /> */}
      </Box>
      <Box style={styles.transBorderWrapper}>
        <Box borderBottomColor="light.Border" style={styles.transborderView} />
      </Box>
      <Box marginX={3}>
        <Box backgroundColor="light.lightYellow" style={styles.inputWrapper}>
          <Box flexDirection="row" alignItems="center">
            <Box marginRight={2}>
              <DollarInput />
            </Box>
            <Box
              marginLeft={2}
              width={0.5}
              backgroundColor="light.borderSaperator"
              opacity={0.3}
              height={7}
            />
            <Input
              placeholder="Enter Amount"
              placeholderTextColor="light.greenText"
              color="light.greenText"
              opacity={0.5}
              width="70%"
              fontSize={RFValue(12)}
              letterSpacing={1.04}
              fontWeight={300}
              borderWidth="0"
              value={amount}
              onChangeText={(value) => setAmount(value)}
              onFocus={() => Keyboard.dismiss()}
            />
          </Box>
          <Pressable
            onPress={() => {
              const confirmBalance = wallet.specs.balances.confirmed;
              if (confirmBalance)
                dispatch(calculateSendMaxFee({ numberOfRecipients: recipientCount, wallet }));
            }}
            style={styles.sendMaxWrapper}
          >
            <Text color="light.sendMax" style={styles.sendMaxText}>
              Send Max
            </Text>
          </Pressable>
        </Box>

        <Box style={styles.addNoteWrapper}>
          <TextInput placeholder="Add a note" style={styles.textInput} />
        </Box>
        <Box style={styles.ctaBtnWrapper}>
          <Box ml={windowWidth * -0.09}>
            <Buttons
              secondaryText="Cancel"
              secondaryCallback={() => {
                navigation.goBack();
              }}
              primaryText="Send"
              primaryCallback={executeSendPhaseOne}
            />
          </Box>
        </Box>
      </Box>
      {/* {!isKeyboardVisible && ( */}
      <Box style={styles.appNumPadWrapper}>
        <AppNumPad
          setValue={setAmount}
          clear={() => setAmount('')}
          color="#073E39"
          height={windowHeight > 670 ? 85 : 65}
          darkDeleteIcon={true}
        />
      </Box>
      {/* )} */}
    </ScreenWrapper>
  );
}
const styles = ScaledSheet.create({
  Container: {
    flex: 1,
  },
  textInput: {
    width: '100%',
    backgroundColor: Colors?.textInputBackground,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    padding: 20,
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
  },
  sendMaxWrapper: {
    paddingHorizontal: hp(10),
    paddingVertical: hp(3),
    borderRadius: 5,
  },
  sendMaxText: {
    fontSize: RFValue(12),
    letterSpacing: 0.6,
    fontWeight: '500',
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
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});
export default AddSendAmount;
