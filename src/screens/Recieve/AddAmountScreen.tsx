import { Input, View } from 'native-base';
import React, { useContext, useState } from 'react';

import AppNumPad from 'src/components/AppNumPad';
import BtcInput from 'src/assets/images/svgs/btc_input.svg';
import Buttons from 'src/components/Buttons';
import Fonts from 'src/common/Fonts';
import HeaderTitle from 'src/components/HeaderTitle';
import { Keyboard } from 'react-native';
import { LocalizationContext } from 'src/common/content/LocContext';
import { ScaledSheet } from 'react-native-size-matters';
import StatusBarComponent from 'src/components/StatusBarComponent';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { hp, windowHeight } from 'src/common/data/responsiveness/responsive';
import { useNavigation } from '@react-navigation/native';

function AddAmountScreen({ route }: { route }) {
  const navigtaion = useNavigation();
  const [amount, setAmount] = useState('');
  const wallet: Wallet = route?.params?.wallet;
  const { translations } = useContext(LocalizationContext);
  const { home } = translations;
  const { common } = translations;

  return (
    <View flex={1}>
      <View style={styles.Container} background="light.ReceiveBackground">
        <StatusBarComponent padding={50} />
        <HeaderTitle
          title={home.AddAmount}
          subtitle={home.amountdesc}
          onPressHandler={() => navigtaion.goBack()}
        />
        <View marginX={8} marginTop={hp(60)}>
          <View
            flexDirection="row"
            width="100%"
            justifyContent="center"
            alignItems="center"
            borderRadius={10}
            backgroundColor="light.primaryBackground"
            marginY={2}
            padding={2}
          >
            <View marginLeft={6}>
              <BtcInput />
            </View>
            <View marginLeft={2} width={0.5} backgroundColor="#BDB7B1" opacity={0.3} height={5} />
            <Input
              placeholder={home.ConvertedAmount}
              placeholderTextColor="light.greenText"
              style={styles.inputField}
              borderWidth="0"
              value={amount}
              onChangeText={(value) => setAmount(value)}
              onFocus={() => Keyboard.dismiss()}
            />
          </View>

          <View marginY={windowHeight > 800 ? hp(70) : hp(40)}>
            <Buttons
              secondaryText={common.cancel}
              secondaryCallback={() => {
                navigtaion.goBack();
              }}
              primaryText="Add"
              primaryCallback={() => {
                navigtaion.navigate('Receive', { amount, wallet });
              }}
            />
          </View>
        </View>
      </View>
      <View position="absolute" bottom={0}>
        <AppNumPad setValue={setAmount} clear={() => setAmount('')} color="#073E39" />
      </View>
    </View>
  );
}

const styles = ScaledSheet.create({
  Container: {
    padding: '20@s',
  },
  inputField: {
    color: '#073E39',
    opacity: 0.5,
    fontFamily: Fonts.RobotoCondensedBold,
    letterSpacing: 1.04,
  },
});
export default AddAmountScreen;
