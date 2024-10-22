/* eslint-disable react/no-unstable-nested-components */
import Text from 'src/components/KeeperText';

import { Box, Input, useColorMode, Pressable, HStack, Center } from 'native-base';
import { Keyboard, ScrollView, StyleSheet, Vibration, View } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import AppNumPad from 'src/components/AppNumPad';
import Buttons from 'src/components/Buttons';

import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import WalletUtilities from 'src/services/wallets/operations/utils';
import { hp, wp } from 'src/constants/responsive';
import KeeperModal from 'src/components/KeeperModal';
import WalletOperations from 'src/services/wallets/operations';
import Fonts from 'src/constants/Fonts';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import BitcoinInput from 'src/assets/images/btc_input.svg';
import useBalance from 'src/hooks/useBalance';
import ReceiveAddress from './ReceiveAddress';
import useSigners from 'src/hooks/useSigners';
import { SignerType } from 'src/services/wallets/enums';
import { CommonActions, useNavigation } from '@react-navigation/native';
import ReceiveQR from './ReceiveQR';
import AddressUsageBadge from './AddressUsageBadge';
import NavLeft from 'src/assets/images/nav-left.svg';
import NavRight from 'src/assets/images/nav-right.svg';
import NewQR from 'src/assets/images/qr-new.svg';
import KeeperTextInput from 'src/components/KeeperTextInput';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { generateNewAddress } from 'src/store/sagaActions/wallets';
import { useAppDispatch } from 'src/store/hooks';

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

  const [currentAddressIdx, setCurrentAddressIdx] = useState(0);
  const [currentAddressIdxTempText, setCurrentAddressIdxTempText] = useState('');
  const [totalAddressesCount, setTotalAddressesCount] = useState(0);

  const [addressUsed, setAddressUsed] = useState(false);

  const dispatch = useAppDispatch();

  const generateNewReceiveAddress = () => {
    dispatch(generateNewAddress(wallet));
    Vibration.vibrate(50);
    const newTotalAddressesCount = totalAddressesCount + 1;
    setTotalAddressesCount(newTotalAddressesCount);
    setCurrentAddressIdx(newTotalAddressesCount);
  };

  useEffect(() => {
    setCurrentAddressIdxTempText(currentAddressIdx.toString());
    if (totalAddressesCount == 0) {
      const receivingAddress = WalletOperations.getNextFreeAddress(wallet);
      setReceivingAddress(receivingAddress);
      setTotalAddressesCount(wallet.specs.totalExternalAddresses);
      setCurrentAddressIdx(wallet.specs.nextFreeAddressIndex + 1);
    } else {
      const receivingAddress = WalletOperations.getExternalAddressAtIdx(
        wallet,
        currentAddressIdx - 1
      );
      setReceivingAddress(receivingAddress);
      setAddressUsed(
        wallet.specs.transactions.some(
          (tx) => tx.recipientAddresses && tx.recipientAddresses.includes(receivingAddress)
        )
      );
    }
  }, [currentAddressIdx]);

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
      <KeeperHeader title={common.receive} titleColor={`${colorMode}.primaryText`} />
      <TouchableOpacity onPress={generateNewReceiveAddress} style={styles.getNewAddressContainer}>
        <Text color={`${colorMode}.pantoneGreen`} style={styles.getNewAddressText} semiBold>
          {home.GetNewAddress}
        </Text>
        <NewQR color={`${colorMode}.pantoneGreen`} size={wp(20)} style={styles.getNewAddressIcon} />
      </TouchableOpacity>
      <ScrollView
        automaticallyAdjustKeyboardInsets={true}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <Box
          style={styles.receiveDataContainer}
          backgroundColor={`${colorMode}.seashellWhite`}
          borderColor={`${colorMode}.greyBorder`}
        >
          <AddressUsageBadge used={addressUsed} />
          <ReceiveQR qrValue={paymentURI || receivingAddress} />
          <Box style={styles.addressContainer}>
            <ReceiveAddress address={paymentURI || receivingAddress} />
          </Box>
        </Box>

        <HStack style={styles.addressPagesBar}>
          <TouchableOpacity
            onPress={() => {
              const newIdx = Math.max(1, currentAddressIdx - 1);
              if (newIdx !== currentAddressIdx) {
                Vibration.vibrate(50);
                setCurrentAddressIdx(newIdx);
              }
            }}
            style={styles.addressPageBtn}
          >
            <NavLeft width={wp(22)} height={hp(22)} />
          </TouchableOpacity>
          <KeeperTextInput
            placeholder=""
            value={currentAddressIdxTempText}
            onChangeText={(text) => {
              setCurrentAddressIdxTempText(text);
            }}
            onBlur={() => {
              if (
                parseInt(currentAddressIdxTempText) &&
                !Number.isNaN(parseInt(currentAddressIdxTempText)) &&
                !(
                  currentAddressIdxTempText.includes('.') || currentAddressIdxTempText.includes(',')
                )
              ) {
                setCurrentAddressIdx(
                  Math.min(totalAddressesCount, parseInt(currentAddressIdxTempText))
                );
              } else {
                setCurrentAddressIdxTempText(currentAddressIdx.toString());
              }
            }}
            width={currentAddressIdx < 100 ? wp(40) : wp(45)}
            height={hp(35)}
            keyboardType="numeric"
            style={styles.addressPageInput}
            fontWeight="200"
          />
          <Text color={`${colorMode}.black`} style={styles.totalAddressesText}>
            of {totalAddressesCount}
          </Text>
          <TouchableOpacity
            onPress={() => {
              const newIdx = Math.min(totalAddressesCount, currentAddressIdx + 1);
              if (newIdx !== currentAddressIdx) {
                Vibration.vibrate(50);
                setCurrentAddressIdx(newIdx);
              }
            }}
            style={styles.addressPageBtn}
          >
            <NavRight width={wp(22)} height={hp(22)} />
          </TouchableOpacity>
        </HStack>

        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text color={`${colorMode}.pantoneGreen`} style={styles.addAmountText} semiBold>
            {home.requestSpecificAmount}
          </Text>
        </TouchableOpacity>
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
  receiveDataContainer: {
    paddingTop: hp(20),
    paddingBottom: hp(10),
    borderRadius: 20,
    borderWidth: 1,
  },
  addAmountText: {
    fontSize: 14,
    width: '100%',
    textAlign: 'center',
    marginTop: hp(25),
  },
  addressPagesBar: {
    marginTop: hp(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressPageInput: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: hp(3),
  },
  totalAddressesText: {
    fontSize: 14,
    marginLeft: wp(8),
  },
  addressPageBtn: {
    marginHorizontal: wp(10),
    width: wp(22),
    height: hp(22),
  },
  getNewAddressContainer: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: hp(16),
  },
  getNewAddressText: {
    fontSize: 14,
    textAlign: 'right',
    flex: 1,
  },
  getNewAddressIcon: {
    marginLeft: wp(9),
    marginRight: wp(10),
    marginTop: hp(1),
  },
});

export default ReceiveScreen;
