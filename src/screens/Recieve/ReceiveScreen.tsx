/* eslint-disable react/no-unstable-nested-components */
import Text from 'src/components/KeeperText';

import { Box, Input, useColorMode, Pressable } from 'native-base';
import { Keyboard, ScrollView, StyleSheet, View } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import AppNumPad from 'src/components/AppNumPad';
import Buttons from 'src/components/Buttons';

import BtcGreen from 'src/assets/images/btc_round_green.svg';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import WalletUtilities from 'src/services/wallets/operations/utils';
import { hp, wp } from 'src/constants/responsive';
import KeeperModal from 'src/components/KeeperModal';
import WalletOperations from 'src/services/wallets/operations';
import MenuItemButton from 'src/components/CustomButton/MenuItemButton';
import Fonts from 'src/constants/Fonts';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import BitcoinInput from 'src/assets/images/btc_input.svg';
import useBalance from 'src/hooks/useBalance';
import ReceiveAddress from './ReceiveAddress';
import useSigners from 'src/hooks/useSigners';
import { SignerType } from 'src/services/wallets/enums';
import { CommonActions, useNavigation } from '@react-navigation/native';
import ReceiveQR from './ReceiveQR';
const AddressVerifiableSigners = [SignerType.BITBOX02, SignerType.LEDGER, SignerType.TREZOR];

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

  const navigation = useNavigation();
  const { vaultSigners } = useSigners(wallet.id);
  const [addVerifiableSigners, setAddVerifiableSigners] = useState([]);

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

  useEffect(() => {
    const avSigner = vaultSigners.filter((signer) =>
      AddressVerifiableSigners.includes(signer?.type)
    );
    setAddVerifiableSigners(avSigner);
  }, []);

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

  const onVerifyAddress = () => {
    const signersMFP = addVerifiableSigners.map((signer) => signer.masterFingerprint);
    navigation.dispatch(
      CommonActions.navigate('VerifyAddressSelectionScreen', {
        signersMFP,
        vaultId: wallet.id,
      })
    );
  };

  const VerifyAddressBtn = () => {
    return (
      <Pressable
        style={[styles.verifyAddressBtn]}
        backgroundColor={`${colorMode}.greenButtonBackground`}
        onPress={onVerifyAddress}
      >
        <Text
          numberOfLines={1}
          style={styles.verifyAddressBtnText}
          color={`${colorMode}.buttonText`}
          bold
        >
          {'Verify Address on Device'}
        </Text>
      </Pressable>
    );
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader title={common.receive} subtitle={walletTranslation.receiveSubTitle} />
      <Box height={hp(10)} />
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <ReceiveQR qrValue={paymentURI || receivingAddress} />
        <Box style={styles.addressContainer}>
          <ReceiveAddress address={paymentURI || receivingAddress} />
          <MenuItemButton
            onPress={() => setModalVisible(true)}
            icon={<BtcGreen />}
            title={home.AddAmount}
            subTitle={walletTranslation.addSpecificInvoiceAmt}
          />
        </Box>
      </ScrollView>
      <Box style={styles.BottomContainer} backgroundColor={`${colorMode}.primaryBackground`}>
        {
          <Box>
            {wallet.entityKind === 'VAULT' && addVerifiableSigners?.length > 0 && (
              <VerifyAddressBtn />
            )}
          </Box>
        }
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
  BottomContainer: {
    marginTop: hp(10),
    width: '95%',
    alignSelf: 'center',
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
  verifyAddressBtn: {
    width: '100%',
    paddingHorizontal: wp(35),
    paddingVertical: hp(15),
    borderRadius: 10,
    alignItems: 'center',
    marginTop: hp(15),
    marginBottom: hp(20),
  },
  verifyAddressBtnText: {
    fontSize: 14,
    letterSpacing: 0.84,
  },
});

export default ReceiveScreen;
