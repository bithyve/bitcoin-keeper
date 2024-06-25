/* eslint-disable react/no-unstable-nested-components */
import Text from 'src/components/KeeperText';

import { Box, Input, useColorMode } from 'native-base';
import { Keyboard, StyleSheet, View } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import AppNumPad from 'src/components/AppNumPad';
import Buttons from 'src/components/Buttons';
import QRCode from 'react-native-qrcode-svg';

import BtcGreen from 'src/assets/images/btc_round_green.svg';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import WalletUtilities from 'src/services/wallets/operations/utils';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import Note from 'src/components/Note/Note';
import KeeperModal from 'src/components/KeeperModal';
import WalletOperations from 'src/services/wallets/operations';
import MenuItemButton from 'src/components/CustomButton/MenuItemButton';
import Fonts from 'src/constants/Fonts';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import BitcoinInput from 'src/assets/images/btc_input.svg';
import useBalance from 'src/hooks/useBalance';
import ReceiveAddress from './ReceiveAddress';

function ReceiveScreen({ route }: { route }) {
  const { colorMode } = useColorMode();
  const { getCurrencyIcon } = useBalance();
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');

  const wallet: Wallet = route?.params?.wallet;
  // const amount = route?.params?.amount;
  const [receivingAddress, setReceivingAddress] = useState(null);
  const [paymentURI, setPaymentURI] = useState(null);

  const { translations } = useContext(LocalizationContext);
  const { common, home, wallet: walletTranslation } = translations;

  useEffect(() => {
    const receivingAddress = WalletOperations.getNextFreeAddress(wallet);
    setReceivingAddress(receivingAddress);
  }, []);

  useEffect(() => {
    if (amount) {
      const newPaymentURI = WalletUtilities.generatePaymentURI(receivingAddress, {
        amount: parseInt(amount) / 1e8,
      }).paymentURI;
      setPaymentURI(newPaymentURI);
    } else if (paymentURI) setPaymentURI(null);
  }, [amount]);

  function AddAmountContent() {
    return (
      <View>
        <View style={styles.Container}>
          <View>
            <Box style={styles.inputWrapper01} backgroundColor={`${colorMode}.seashellWhite`}>
              <View style={styles.btcIconWrapper}>
                {getCurrencyIcon(BitcoinInput, colorMode === 'light' ? 'dark' : 'light')}
              </View>
              <Box
                style={styles.verticalDeviderLine}
                backgroundColor={`${colorMode}.secondaryText`}
              />
              <Input
                placeholder={home.ConvertedAmount}
                placeholderTextColor={`${colorMode}.greenText`}
                style={styles.inputField}
                borderWidth="0"
                value={amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                onChangeText={(value) => setAmount(value)}
                onFocus={() => Keyboard.dismiss()}
                testID="input_receiveAmount"
              />
            </Box>

            <View style={styles.bottomBtnView}>
              <Buttons
                secondaryText={common.cancel}
                secondaryCallback={() => {
                  setModalVisible(false);
                }}
                primaryText="Add"
                primaryCallback={() => {
                  setModalVisible(false);
                }}
              />
            </View>
          </View>
        </View>
        <View>
          <AppNumPad
            setValue={setAmount}
            clear={() => setAmount('')}
            color={colorMode === 'light' ? '#041513' : '#FFF'}
            darkDeleteIcon={colorMode === 'light'}
          />
        </View>
      </View>
    );
  }
  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader title={common.receive} subtitle={walletTranslation.receiveSubTitle} />
      <Box
        testID="view_recieveAddressQR"
        style={styles.qrWrapper}
        borderColor={`${colorMode}.qrBorderColor`}
      >
        <QRCode
          value={paymentURI || receivingAddress || 'address'}
          logoBackgroundColor="transparent"
          size={hp(200)}
        />
        <Box background={`${colorMode}.QrCode`} style={styles.receiveAddressWrapper}>
          <Text
            bold
            style={styles.receiveAddressText}
            color={`${colorMode}.recieverAddress`}
            numberOfLines={1}
          >
            {walletTranslation.receiveAddress}
          </Text>
        </Box>
      </Box>
      <Box style={styles.addressContainer}>
        <ReceiveAddress address={paymentURI || receivingAddress} />
        <MenuItemButton
          onPress={() => setModalVisible(true)}
          icon={<BtcGreen />}
          title={home.AddAmount}
          subTitle={walletTranslation.addSpecificInvoiceAmt}
        />
      </Box>

      <Box style={styles.Note}>
        <Note
          title={'Note'}
          subtitle={
            wallet.entityKind === 'VAULT'
              ? walletTranslation.addressReceiveDirectly
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
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
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
    marginTop: windowHeight > 600 ? hp(35) : 0,
    alignItems: 'center',
    alignSelf: 'center',
    width: hp(250),
    borderWidth: 30,
  },
  receiveAddressWrapper: {
    height: 28,
    width: '100%',
    justifyContent: 'center',
  },
  receiveAddressText: {
    textAlign: 'center',
    fontSize: 12,
    letterSpacing: 1.08,
    width: '100%',
  },
  Container: {
    padding: 10,
  },
  inputField: {
    color: '#073E39',
    opacity: 0.8,
    fontFamily: Fonts.FiraSansBold,
    letterSpacing: 1.04,
  },
  inputWrapper01: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    borderRadius: 10,
    marginVertical: 5,
    padding: 5,
  },
  verticalDeviderLine: {
    marginLeft: 5,
    width: 2,
    opacity: 0.5,
    height: 15,
  },
  btcIconWrapper: {
    marginLeft: 6,
  },
  bottomBtnView: {
    marginBottom: 10,
  },
  addressContainer: {
    marginHorizontal: wp(20),
  },
});

export default ReceiveScreen;
