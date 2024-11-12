import { Input, useColorMode } from 'native-base';
import React, { useContext, useState } from 'react';

import AppNumPad from 'src/components/AppNumPad';
import BtcInput from 'src/assets/images/btc_input.svg';
import Buttons from 'src/components/Buttons';
import KeeperHeader from 'src/components/KeeperHeader';
import { Keyboard, StyleSheet, View } from 'react-native';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import StatusBarComponent from 'src/components/StatusBarComponent';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { hp, windowHeight } from 'src/constants/responsive';
import { useNavigation } from '@react-navigation/native';
import Fonts from 'src/constants/Fonts';
import { Colors } from 'react-native/Libraries/NewAppScreen';

function AddAmountScreen({ route }: { route }) {
  const { colorMode } = useColorMode();
  const navigtaion = useNavigation();
  const [amount, setAmount] = useState('');
  const wallet: Wallet = route?.params?.wallet;
  const { translations } = useContext(LocalizationContext);
  const { home } = translations;
  const { common } = translations;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.Container, { backgroundColor: `${colorMode}.secondaryBackground` }]}>
        <StatusBarComponent padding={50} />
        <KeeperHeader title={home.AddAmount} subtitle={home.amountdesc} />
        <View style={styles.inputParentView}>
          <View
            style={[styles.inputWrapper, { backgroundColor: `${colorMode}.primaryBackground` }]}
          >
            <View style={styles.btcIconWrapper}>
              <BtcInput />
            </View>
            <View style={[styles.verticalDeviderLine, { backgroundColor: '#BDB7B1' }]} />
            <Input
              backgroundColor={`${colorMode}.seashellWhite`}
              placeholder={home.ConvertedAmount}
              placeholderTextColor={`${colorMode}.greenText`}
              style={styles.inputField}
              borderWidth="0"
              value={amount}
              onChangeText={(value) => setAmount(value)}
              onFocus={() => Keyboard.dismiss()}
              _input={
                colorMode === 'dark' && {
                  selectionColor: Colors.SecondaryWhite,
                  cursorColor: Colors.SecondaryWhite,
                }
              }
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
          color={`${colorMode}.greenText`}
          darkDeleteIcon
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  Container: {
    padding: 20,
  },
  wrapper: {
    flex: 1,
  },
  inputField: {
    color: '#073E39',
    opacity: 0.5,
    fontFamily: Fonts.InterBold,
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
