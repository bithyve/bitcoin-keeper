import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Keyboard } from 'react-native';

import { Input, View } from 'native-base';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';

import Fonts from 'src/common/Fonts';
import HeaderTitle from 'src/components/HeaderTitle';
import StatusBarComponent from 'src/components/StatusBarComponent';
import { windowHeight } from 'src/common/data/responsiveness/responsive';
import { Wallet } from 'src/core/wallets/interfaces/interface';
import Buttons from 'src/components/Buttons';
import AppNumPad from 'src/components/AppNumPad';
import BtcInput from 'src/assets/images/svgs/btc_input.svg'

const AddAmountScreen = ({ route }) => {
  const navigtaion = useNavigation();
  const [amount, setAmount] = useState('');
  const wallet: Wallet = route?.params?.wallet;
  return (
    <View style={styles.Container} background={'light.ReceiveBackground'}>
      <StatusBarComponent padding={50} />
      <HeaderTitle
        title="Add Amount"
        subtitle="Lorem ipsum dolor sit amet"
        onPressHandler={() => navigtaion.goBack()}
        color={'light.ReceiveBackground'}
      />
      <View marginX={8} marginY={windowHeight / 8}>
        <View
          flexDirection={'row'}
          width={'100%'}
          justifyContent={'center'}
          alignItems={'center'}
          borderRadius={10}
          backgroundColor={'light.lightYellow'}
          marginY={2}
          padding={2}
        >
          <View marginLeft={6}>
            <BtcInput />
          </View>
          <View marginLeft={2} width={0.5} backgroundColor={'#BDB7B1'} opacity={0.3} height={5} />
          < Input
            placeholder="Converted Amount"
            placeholderTextColor={'light.greenText'}
            style={styles.inputField}
            borderWidth={'0'}
            value={amount}
            onChangeText={(value) => setAmount(value)}
            onFocus={() => Keyboard.dismiss()}
          />
        </View>

        <View marginY={20}>
          <Buttons
            secondaryText={'Cancle'}
            secondaryCallback={() => { console.log('Cancle') }}
            primaryText={'Add'}
            primaryCallback={() => { navigtaion.navigate('Receive', { amount, wallet }) }}
          />
        </View>

        <AppNumPad setValue={setAmount} ok={() => { }} clear={() => setAmount('')} color={'#073E39'} />
      </View>
    </View>
  );
};

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    padding: '20@s',
  },
  addWalletText: {
    fontSize: RFValue(22),
    lineHeight: '20@s',
    letterSpacing: '0.7@s',
    marginTop: hp(5),
  },
  addWalletDescription: {
    fontSize: RFValue(12),
    lineHeight: '15@s',
    letterSpacing: '0.5@s',
  },
  inputField: {
    color: '#073E39',
    opacity: 0.5,
    fontFamily: Fonts.RobotoCondensedBold,
    fontSize: RFValue(10),
    letterSpacing: 1.04,
  },

});
export default AddAmountScreen;
