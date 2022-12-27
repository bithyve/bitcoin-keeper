import { Input } from 'native-base';
import React, { useContext, useState } from 'react';

import AppNumPad from 'src/components/AppNumPad';
import BtcInput from 'src/assets/images/svgs/btc_input.svg';
import Buttons from 'src/components/Buttons';
import Fonts from 'src/common/Fonts';
import HeaderTitle from 'src/components/HeaderTitle';
import { Keyboard, View } from 'react-native';
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
    <View style={styles.wrapper}>
      <View style={[styles.Container, { backgroundColor: 'light.secondaryBackground' }]}>
        <StatusBarComponent padding={50} />
        <HeaderTitle
          title={home.AddAmount}
          subtitle={home.amountdesc}
          onPressHandler={() => navigtaion.goBack()}
        />
        <View style={styles.inputParentView}>
          <View style={[styles.inputWrapper, { backgroundColor: 'light.primaryBackground' }]}>
            <View style={styles.btcIconWrapper}>
              <BtcInput />
            </View>
            <View style={[styles.verticalDeviderLine, { backgroundColor: '#BDB7B1' }]} />
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

          <View style={{ marginVertical: windowHeight > 800 ? hp(70) : hp(40) }}>
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
      <View style={styles.bottomBtnView}>
        <AppNumPad
          setValue={setAmount}
          clear={() => setAmount('')}
          color="light.greenText"
          darkDeleteIcon
        />
      </View>
    </View>
  );
}

const styles = ScaledSheet.create({
  Container: {
    padding: '20@s',
  },
  wrapper: {
    flex: 1,
  },
  inputField: {
    color: '#073E39',
    opacity: 0.5,
    fontFamily: Fonts.RobotoCondensedBold,
    letterSpacing: 1.04,
  },
  inputParentView: {
    marginHorizontal: 8,
    marginTop: hp(60),
  },
  inputWrapper: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    borderRadius: 10,
    marginVertical: 2,
    padding: 7,
  },
  verticalDeviderLine: {
    marginLeft: 5,
    width: 1,
    opacity: 0.5,
    height: 15,
  },
  btcIconWrapper: {
    marginLeft: 6,
  },
  bottomBtnView: {
    position: 'absolute',
    bottom: 0,
  },
});
export default AddAmountScreen;
