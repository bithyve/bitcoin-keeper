import React, { useEffect, useState, useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Keyboard } from 'react-native';

import { Input, View } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';

import Fonts from 'src/common/Fonts';
import HeaderTitle from 'src/components/HeaderTitle';
import StatusBarComponent from 'src/components/StatusBarComponent';
import { hp } from 'src/common/data/responsiveness/responsive';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import Buttons from 'src/components/Buttons';
import AppNumPad from 'src/components/AppNumPad';
import BtcInput from 'src/assets/images/svgs/btc_input.svg';
import { LocalizationContext } from 'src/common/content/LocContext';

const AddAmountScreen = ({ route }: { route }) => {
  const navigtaion = useNavigation();
  const [amount, setAmount] = useState('');
  const wallet: Wallet = route?.params?.wallet;
  const { translations } = useContext(LocalizationContext);
  const home = translations['home'];
  const common = translations['common'];

  return (
    <View flex={1}>
      <View style={styles.Container} background={'light.ReceiveBackground'}>
        <StatusBarComponent padding={50} />
        <HeaderTitle
          title={home.AddAmount}
          subtitle={home.amountdesc}
          onPressHandler={() => navigtaion.goBack()}
        />
        <View marginX={8} marginTop={hp(80)}>
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
            <Input
              placeholder={home.ConvertedAmount}
              placeholderTextColor={'light.greenText'}
              style={styles.inputField}
              borderWidth={'0'}
              value={amount}
              onChangeText={(value) => setAmount(value)}
              onFocus={() => Keyboard.dismiss()}
            />
          </View>

          <View marginY={hp(70)}>
            <Buttons
              secondaryText={common.cancel}
              secondaryCallback={() => {
                navigtaion.goBack();
              }}
              primaryText={'Add'}
              primaryCallback={() => {
                navigtaion.navigate('Receive', { amount, wallet });
              }}
            />
          </View>

        </View>
      </View>
      <View position={'absolute'} bottom={0}>
        <AppNumPad
          setValue={setAmount}
          ok={() => {
            console.log('ok');
          }}
          clear={() => setAmount('')}
          color={'#073E39'}
        />
      </View>
    </View>
  );
};

const styles = ScaledSheet.create({
  Container: {
    padding: '20@s',
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
