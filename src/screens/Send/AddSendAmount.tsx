import React, { useState } from 'react';
import { Box, Input, Text } from 'native-base';
import { Keyboard, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScaledSheet } from 'react-native-size-matters';
import { RFValue } from 'react-native-responsive-fontsize';

import StatusBarComponent from 'src/components/StatusBarComponent';
import Header from 'src/components/Header';
import Buttons from 'src/components/Buttons';
import { windowHeight, windowWidth } from 'src/common/data/responsiveness/responsive';
import AppNumPad from 'src/components/AppNumPad';
import DollarInput from 'src/assets/images/svgs/icon_dollar.svg';
import Colors from 'src/theme/Colors';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { useDispatch } from 'react-redux';
import { sendPhaseOne } from 'src/store/sagaActions/send_and_receive';

const AddSendAmount = ({ route }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {
    wallet,
    address,
    amount: prefillAmount,
  }: { wallet: Wallet; address: string; amount: string } = route.params;
  const [amount, setAmount] = useState(prefillAmount ? prefillAmount : '');
  const navigateToNext = (recipients) => {
    navigation.navigate('SendConfirmation', {
      wallet,
      recipients,
    });
  };

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
    navigateToNext(recipients);
  };

  return (
    <Box flex={1} padding={2} background={'light.ReceiveBackground'}>
      <StatusBarComponent padding={50} />
      <Box marginLeft={3}>
        <Header
          title="Sending to address"
          subtitle="Lorem ipsum dolor sit amet,"
          onPressHandler={() => navigation.goBack()}
        />
      </Box>
      <Box
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
      </Box>

      <Box marginX={8}>
        <Box
          flexDirection={'row'}
          width={'100%'}
          justifyContent={'center'}
          alignItems={'center'}
          borderRadius={10}
          backgroundColor={'light.lightYellow'}
          marginY={2}
          padding={3}
        >
          <Box marginLeft={10} marginRight={2}>
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
            fontSize={RFValue(12)}
            letterSpacing={1.04}
            fontWeight={300}
            borderWidth={'0'}
            value={amount}
            onChangeText={(value) => setAmount(value)}
            onFocus={() => Keyboard.dismiss()}
          />
        </Box>
        <Box
          flexDirection={'row'}
          marginY={2}
          width={'100%'}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <TextInput placeholder="Add a note" style={styles.textInput} />
        </Box>
        <Box marginTop={3} marginBottom={5} flexDirection={'row'}>
          <Box ml={windowWidth * -0.1}>
            <Buttons
              secondaryText={'Add Recipient'}
              secondaryCallback={() => {
                // navigation.navigate('SendConfirmation');
                console.log('Batch Send');
              }}
            />
          </Box>
          <Box ml={windowWidth * -0.09}>
            <Buttons
              secondaryText={'Cancel'}
              secondaryCallback={() => {
                console.log('Cancel');
              }}
              primaryText={'Send'}
              primaryCallback={executeSendPhaseOne}
            />
          </Box>
        </Box>
      </Box>
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
  );
};
const styles = ScaledSheet.create({
  textInput: {
    width: '100%',
    backgroundColor: Colors?.textInputBackground,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    padding: 20,
  },
});
export default AddSendAmount;
