import { Box, Input, Pressable, Text } from 'native-base';
import { Keyboard, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { calculateSendMaxFee, sendPhaseOne } from 'src/store/sagaActions/send_and_receive';
import { hp, windowHeight, windowWidth, wp } from 'src/common/data/responsiveness/responsive';

import AppNumPad from 'src/components/AppNumPad';
import Buttons from 'src/components/Buttons';
import Colors from 'src/theme/Colors';
import BitcoinInput from 'src/assets/images/svgs/btc_input.svg';

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
import { TransferType } from 'src/common/data/enums/TransferType';
import { Vault } from 'src/core/wallets/interfaces/vault';

function AddSendAmount({ route }) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {
    sender,
    recipient,
    address,
    amount: prefillAmount,
    transferType,
  }: {
    sender: Wallet | Vault;
    recipient: Wallet | Vault;
    address: string;
    amount: string;
    transferType: TransferType;
  } = route.params;

  const [amount, setAmount] = useState(prefillAmount || '');
  const [recipientCount, setReicipientCount] = useState(1);
  const sendMaxFee = useAppSelector((state) => state.sendAndReceive.sendMaxFee);
  const sendPhaseOneState = useAppSelector((state) => state.sendAndReceive.sendPhaseOne);

  useEffect(() => {
    const confirmBalance = sender.specs.balances.confirmed;
    if (sendMaxFee && confirmBalance) {
      const sendMaxBalance = confirmBalance - sendMaxFee;
      setAmount(`${sendMaxBalance}`);
    }
  }, [sendMaxFee]);

  const navigateToNext = () => {
    navigation.navigate('SendConfirmation', {
      sender,
      recipient,
      address,
      amount: parseInt(amount),
      transferType,
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
        wallet: sender,
        recipients,
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
          transferType == TransferType.WALLET_TO_WALLET ? `Sending to Wallet` : `Enter the amount`
        }
        // subtitle={`Sending to ${address}`}
      />
      <Box
        style={{
          marginVertical: hp(5),
        }}
      >
        <WalletDetails
          availableAmt={sender?.specs.balances.confirmed}
          walletName={sender?.presentationData.name}
        />
      </Box>

      <Box
        alignItems="center"
        style={{
          marginVertical: hp(20),
        }}
      >
        <Box borderBottomColor="light.Border" borderBottomWidth={1} width={wp(280)} opacity={0.1} />
      </Box>
      <Box marginX={3}>
        <Box
          flexDirection="row"
          width="100%"
          justifyContent="space-between"
          alignItems="center"
          borderRadius={10}
          backgroundColor="light.lightYellow"
          style={{
            marginVertical: hp(5),
          }}
          padding={3}
        >
          <Box flexDirection="row" alignItems="center">
            <Box marginRight={2}>
              <BitcoinInput />
            </Box>
            <Box
              marginLeft={2}
              width={0.5}
              backgroundColor="light.borderSaperator"
              opacity={0.3}
              height={7}
            />
            <Input
              placeholder="Enter Amount (sats)"
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
              const confirmBalance = sender.specs.balances.confirmed;
              if (confirmBalance)
                dispatch(
                  calculateSendMaxFee({ numberOfRecipients: recipientCount, wallet: sender })
                );
            }}
            style={{
              paddingHorizontal: hp(10),
              paddingVertical: hp(6),
              borderRadius: 5,
            }}
          >
            <Text color="light.sendMax" fontSize={RFValue(12)} letterSpacing={0.6} fontWeight={300}>
              Send Max
            </Text>
          </Pressable>
        </Box>

        <Box
          flexDirection="row"
          style={{
            marginVertical: hp(2),
          }}
          width="100%"
          justifyContent="center"
          alignItems="center"
        >
          <TextInput placeholder="Add a note to self" style={styles.textInput} />
        </Box>
        <Box
          style={{
            marginBottom: hp(5),
          }}
          flexDirection="row"
          justifyContent="flex-end"
        >
          <Box ml={windowWidth * -0.09}>
            <Buttons
              secondaryText="Cancel"
              secondaryCallback={() => {
                navigation.goBack();
              }}
              primaryText="Send"
              primaryDisable={Boolean(!amount)}
              primaryCallback={executeSendPhaseOne}
            />
          </Box>
        </Box>
      </Box>
      <Box position="absolute" bottom={0} alignItems="center" width={wp(375)}>
        <AppNumPad
          setValue={setAmount}
          clear={() => setAmount('')}
          color="#073E39"
          height={windowHeight >= 850 ? 80 : 60}
        />
      </Box>
    </ScreenWrapper>
  );
}
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
