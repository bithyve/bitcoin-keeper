import Text from 'src/components/KeeperText';

import { Box, Input } from 'native-base';
import { Keyboard, StyleSheet, TouchableOpacity, View } from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import React, { useContext, useEffect, useState } from 'react';
import AppNumPad from 'src/components/AppNumPad';
import BtcInput from 'src/assets/images/btc_input.svg';
import Buttons from 'src/components/Buttons';
import Fonts from 'src/common/Fonts';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation } from '@react-navigation/native';

import ArrowIcon from 'src/assets/images/icon_arrow.svg';
import BtcGreen from 'src/assets/images/btc_round_green.svg';
import CopyIcon from 'src/assets/images/icon_copy.svg';
import HeaderTitle from 'src/components/HeaderTitle';
import { LocalizationContext } from 'src/common/content/LocContext';
import ScreenWrapper from 'src/components/ScreenWrapper';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { getNextFreeAddress } from 'src/store/sagas/send_and_receive';
import { hp } from 'src/common/data/responsiveness/responsive';
import useToastMessage from 'src/hooks/useToastMessage';
import Note from 'src/components/Note/Note';
import KeeperModal from 'src/components/KeeperModal';

function ReceiveScreen({ route }: { route }) {
  const navigtaion = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');

  const wallet: Wallet = route?.params?.wallet;
  // const amount = route?.params?.amount;
  const [receivingAddress, setReceivingAddress] = useState(null);
  const [paymentURI, setPaymentURI] = useState(null);

  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const { home } = translations;

  useEffect(() => {
    const receivingAddress = getNextFreeAddress(wallet);
    setReceivingAddress(receivingAddress);
  }, []);

  useEffect(() => {
    if (amount) {
      const newPaymentURI = WalletUtilities.generatePaymentURI(receivingAddress, {
        amount: parseInt(amount) / 10e8,
      }).paymentURI;
      setPaymentURI(newPaymentURI);
    } else if (paymentURI) setPaymentURI(null);
  }, [amount]);

  const { showToast } = useToastMessage();

  function AddAmountContent() {
    return (
      <View>
        <View style={styles.Container}>
          <View style={styles.inputParentView}>
            <View style={[styles.inputWrapper01, { backgroundColor: 'light.primaryBackground' }]}>
              <View style={styles.btcIconWrapper}>
                <BtcInput />
              </View>
              <View style={[styles.verticalDeviderLine, { backgroundColor: '#BDB7B1' }]} />
              <Input
                placeholder={home.ConvertedAmount}
                placeholderTextColor="light.greenText"
                style={styles.inputField}
                borderWidth="0"
                value={amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                onChangeText={(value) => setAmount(value)}
                onFocus={() => Keyboard.dismiss()}
              />
            </View>

            <View style={styles.bottomBtnView}>
              <Buttons
                secondaryText={common.cancel}
                secondaryCallback={() => {
                  setModalVisible(false);
                }}
                primaryText="Add"
                primaryCallback={() => {
                  setModalVisible(false);
                  // navigtaion.navigate('Receive', { amount, wallet });
                }}
              />
            </View>
          </View>
        </View>
        <View>
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
  return (
    <ScreenWrapper>
      <HeaderTitle
        title={common.receive}
        subtitle="Native segwit address"
        onPressHandler={() => navigtaion.goBack()}
        headerTitleColor="light.textBlack"
        paddingTop={hp(6)}
      />
      <Box style={styles.qrWrapper}>
        <QRCode
          value={paymentURI || receivingAddress || 'address'}
          logoBackgroundColor="transparent"
          size={hp(200)}
        />
        <Box background="light.QrCode" style={styles.receiveAddressWrapper}>
          <Text style={styles.receiveAddressText} color="light.recieverAddress">
            Receive Address
          </Text>
        </Box>
      </Box>
      {/* {Input Field} */}
      <TouchableOpacity
        activeOpacity={0.4}
        onPress={() => {
          Clipboard.setString(paymentURI || receivingAddress);
          showToast('Address Copied Successfully', <TickIcon />);
        }}
        style={styles.inputContainer}
      >
        <Box style={styles.inputWrapper} backgroundColor="light.textInputBackground">
          <Text width="80%" marginLeft={4} numberOfLines={1}>
            {paymentURI || receivingAddress}
          </Text>

          <Box backgroundColor="light.copyBackground" style={styles.copyIconWrapper}>
            <CopyIcon />
          </Box>
        </Box>
      </TouchableOpacity>
      {/* {Add amount component} */}
      <TouchableOpacity
        activeOpacity={0.5}
        style={styles.addAmountContainer}
        onPress={() => {
          setModalVisible(true);
        }}
      >
        <Box style={styles.addAmountWrapper01} backgroundColor="light.primaryBackground">
          <Box flexDirection="row">
            <BtcGreen />
            <Box flexDirection="column" marginLeft={5}>
              <Text color="light.primaryText" style={styles.addAmountText}>
                {home.AddAmount}
              </Text>
              <Text color="light.GreyText" style={styles.addAmountSubTitleText}>
                Add a specific invoice amount
              </Text>
            </Box>
          </Box>
          <ArrowIcon />
        </Box>
      </TouchableOpacity>
      {/* {Bottom note} */}
      <Box style={styles.Note}>
        <Note
          title={wallet.entityKind === 'VAULT' ? 'Security Tip' : home.AddAmount}
          subtitle={
            wallet.entityKind === 'VAULT'
              ? 'You can get a receive address directly from a signing device and do not have to trust the Keeper app'
              : home.reflectSats
          }
          subtitleColor="GreyText"
        />
      </Box>
      <KeeperModal
        visible={modalVisible}
        showCloseIcon={false}
        close={() => setModalVisible(false)}
        title={home.AddAmount}
        subTitle={home.amountdesc}
        textColor="light.primaryText"
        Content={AddAmountContent}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  Note: {
    position: 'absolute',
    bottom: hp(20),
    width: '90%',
    marginLeft: 30,
  },
  qrWrapper: {
    marginTop: hp(50),
    alignItems: 'center',
    alignSelf: 'center',
    width: hp(200),
  },
  receiveAddressWrapper: {
    height: 28,
    width: '100%',
    justifyContent: 'center',
  },
  receiveAddressText: {
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 12,
    letterSpacing: 1.08,
    width: '100%',
    numberOfLines: 1,
  },
  inputContainer: {
    alignItems: 'center',
    borderBottomLeftRadius: 10,
    borderTopLeftRadius: 10,
    marginTop: hp(40),
  },
  inputWrapper: {
    flexDirection: 'row',
    width: '90%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  copyIconWrapper: {
    padding: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  addAmountContainer: {
    marginTop: hp(50),
  },
  addAmountWrapper01: {
    flexDirection: 'row',
    height: hp(70),
    borderRadius: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginHorizontal: 16,
  },
  addAmountText: {
    fontWeight: '400',
    fontSize: 14,
    letterSpacing: 1.12,
  },
  addAmountSubTitleText: {
    fontWeight: '400',
    fontSize: 12,
    letterSpacing: 0.6,
  },
  Container: {
    padding: 10,
  },
  inputField: {
    color: '#073E39',
    opacity: 0.5,
    fontFamily: Fonts.RobotoCondensedBold,
    letterSpacing: 1.04,
  },
  inputParentView: {
    marginHorizontal: 8,
  },
  inputWrapper01: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    borderRadius: 10,
    marginVertical: 5,
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
    marginBottom: 10,
  },
});

export default ReceiveScreen;
