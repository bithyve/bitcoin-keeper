import { Box, Input, Pressable, Text } from 'native-base';
import { Keyboard, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { hp, windowHeight, windowWidth, wp } from 'src/common/data/responsiveness/responsive';

import AppNumPad from 'src/components/AppNumPad';
import Buttons from 'src/components/Buttons';
import Colors from 'src/theme/Colors';
import DollarInput from 'src/assets/images/svgs/icon_dollar.svg';
import HeaderTitle from 'src/components/HeaderTitle';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import ScreenWrapper from 'src/components/ScreenWrapper';
import Transactions from './Transactions';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { calculateSendMaxFee, sendPhaseOne } from 'src/store/sagaActions/send_and_receive';
import { sendPhaseOneReset } from 'src/store/reducers/send_and_receive';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import useToastMessage from 'src/hooks/useToastMessage';
import { useAppSelector } from 'src/store/hooks';
import WalletDetails from './WalletDetails';

const AddSendAmount = ({ route }) => {
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

  const [amount, setAmount] = useState(prefillAmount ? prefillAmount : '');
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
      amount: parseInt(amount),
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
        amount: parseInt(amount),
      });
      navigateToNext(recipients);
    } else if (sendPhaseOneState.hasFailed) {
      if (sendPhaseOneState.failedErrorMessage === 'Insufficient balance')
        showToast('You have insufficient balance at this time.', null, 1000);
      else showToast(sendPhaseOneState.failedErrorMessage, null, 1000);
    }
  }, [sendPhaseOneState]);

  useEffect(() => {
    return () => {
      dispatch(sendPhaseOneReset());
    };
  }, []);

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
      <Box
        style={{
          marginVertical: hp(5),
        }}
      >
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
      <Box
        alignItems={'center'}
        style={{
          marginVertical: hp(20),
        }}
      >
        <Box
          borderBottomColor={'light.Border'}
          borderBottomWidth={1}
          width={wp(280)}
          opacity={0.1}
        />
      </Box>
      <Box marginX={3}>
        <Box
          flexDirection={'row'}
          width={'100%'}
          justifyContent={'space-between'}
          alignItems={'center'}
          borderRadius={10}
          backgroundColor={'light.lightYellow'}
          style={{
            marginVertical: hp(5),
          }}
          padding={3}
        >
          <Box flexDirection={'row'} alignItems={'center'}>
            <Box marginRight={2}>
              <DollarInput />
            </Box>
            <Box
              marginLeft={2}
              width={0.5}
              backgroundColor={'light.borderSaperator'}
              opacity={0.3}
              height={7}
            />
            <Input
              placeholder="Enter Amount"
              placeholderTextColor={'light.greenText'}
              color={'light.greenText'}
              opacity={0.5}
              width={'70%'}
              fontSize={RFValue(12)}
              letterSpacing={1.04}
              fontWeight={300}
              borderWidth={'0'}
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
            style={{
              paddingHorizontal: hp(10),
              paddingVertical: hp(3),
              borderRadius: 5,
            }}
          >
            <Text
              color={'light.sendMax'}
              fontSize={RFValue(12)}
              letterSpacing={0.6}
              fontWeight={300}
            >
              Send Max
            </Text>
          </Pressable>
        </Box>

        <Box
          flexDirection={'row'}
          style={{
            marginVertical: hp(2),
          }}
          width={'100%'}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <TextInput placeholder="Add a note" style={styles.textInput} />
        </Box>
        <Box
          style={{
            marginBottom: hp(5),
          }}
          flexDirection={'row'}
          justifyContent={'flex-end'}
        >
          <Box ml={windowWidth * -0.09}>
            <Buttons
              secondaryText={'Cancel'}
              secondaryCallback={() => {
                navigation.goBack();
              }}
              primaryText={'Send'}
              primaryCallback={executeSendPhaseOne}
            />
          </Box>
        </Box>
      </Box>
      <Box position={'absolute'} bottom={0} alignItems={'center'} width={wp(375)}>
        <AppNumPad
          setValue={setAmount}
          ok={() => {
            console.log('ok');
          }}
          clear={() => setAmount('')}
          color={'#073E39'}
          height={windowHeight >= 850 ? 80 : 60}
        />
      </Box>
    </ScreenWrapper>
  );
};
const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    padding: '20@s',
  },
  textInput: {
    width: '100%',
    backgroundColor: Colors?.textInputBackground,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    padding: 20,
  },
});
export default AddSendAmount;
