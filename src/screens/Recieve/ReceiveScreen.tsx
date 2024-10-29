/* eslint-disable react/no-unstable-nested-components */
import Text from 'src/components/KeeperText';

import { Box, Input, useColorMode, Pressable, HStack, Center, theme } from 'native-base';
import { Keyboard, ScrollView, StyleSheet, Vibration, View } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import AppNumPad from 'src/components/AppNumPad';
import Buttons from 'src/components/Buttons';

import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import WalletUtilities from 'src/services/wallets/operations/utils';
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';
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
import NavLeftWhite from 'src/assets/images/nav-left-white.svg';
import NavRight from 'src/assets/images/nav-right.svg';
import NavRightWhite from 'src/assets/images/nav-right-white.svg';
import NewQR from 'src/assets/images/qr-new.svg';
import NewQRWhite from 'src/assets/images/qr-new-white.svg';
import KeeperTextInput from 'src/components/KeeperTextInput';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { generateNewAddress } from 'src/store/sagaActions/wallets';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import Close from 'src/assets/images/modal_close.svg';
import ErrorIcon from 'src/assets/images/error.svg';
import ErrorDarkIcon from 'src/assets/images/error-dark.svg';
import useLabelsNew from 'src/hooks/useLabelsNew';
import { UTXOLabel } from 'src/components/UTXOsComponents/UTXOList';
import LabelsEditor from '../UTXOManagement/components/LabelsEditor';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import useExchangeRates from 'src/hooks/useExchangeRates';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import { SATOSHIS_IN_BTC } from 'src/constants/Bitcoin';

const AddressVerifiableSigners = [SignerType.BITBOX02, SignerType.LEDGER, SignerType.TREZOR];

function ReceiveScreen({ route }: { route }) {
  const { colorMode } = useColorMode();
  const { getCurrencyIcon } = useBalance();
  const [modalVisible, setModalVisible] = useState(false);
  const [labelsModalVisible, setLabelsModalVisible] = useState(false);
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

  const { showToast } = useToastMessage();

  const { labels: addressLabels } = useLabelsNew({ address: receivingAddress, wallet });
  const labels = addressLabels ? addressLabels[receivingAddress] || [] : [];

  const { satsEnabled }: { satsEnabled: boolean } = useAppSelector((state) => state.settings);
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  const exchangeRates = useExchangeRates();
  const currencyCode = useCurrencyCode();

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

  function convertFiatToSats(fiatAmount: number) {
    return exchangeRates && exchangeRates[currencyCode]
      ? (fiatAmount / exchangeRates[currencyCode].last) * SATOSHIS_IN_BTC
      : 0;
  }

  useEffect(() => {
    if (amount) {
      let convertedAmount;
      if (currentCurrency === CurrencyKind.BITCOIN) {
        if (satsEnabled) convertedAmount = parseInt(amount) / 1e8;
        else convertedAmount = parseFloat(amount);
      } else
        convertedAmount =
          parseInt(convertFiatToSats(parseFloat(amount)).toFixed(0).toString()) / 1e8;

      const newPaymentURI = WalletUtilities.generatePaymentURI(receivingAddress, {
        amount: convertedAmount,
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
                style={styles.inputField}
                borderWidth="0"
                value={amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                onChangeText={(value) => setAmount(value)}
                onFocus={() => Keyboard.dismiss()}
                testID="input_receiveAmount"
                _input={
                  colorMode === 'dark' && {
                    selectionColor: Colors.SecondaryWhite,
                    cursorColor: Colors.SecondaryWhite,
                  }
                }
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
            decimalPoint
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
      <Box style={{ flexDirection: 'row' }}>
        <KeeperHeader title={common.receive} titleColor={`${colorMode}.primaryText`} />
        <TouchableOpacity onPress={generateNewReceiveAddress} style={styles.getNewAddressContainer}>
          <Text color={`${colorMode}.textGreen`} style={styles.getNewAddressText} semiBold>
            {home.GetNewAddress}
          </Text>
          {colorMode === 'light' ? (
            <NewQR size={wp(20)} style={styles.getNewAddressIcon} />
          ) : (
            <NewQRWhite size={wp(20)} style={styles.getNewAddressIcon} />
          )}
        </TouchableOpacity>
      </Box>
      <ScrollView
        automaticallyAdjustKeyboardInsets={true}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        alwaysBounceHorizontal={false}
        alwaysBounceVertical={false}
        bounces={false}
      >
        <Box
          style={styles.receiveDataContainer}
          backgroundColor={`${colorMode}.seashellWhite`}
          borderColor={`${colorMode}.greyBorder`}
        >
          <AddressUsageBadge used={addressUsed} />
          <TouchableOpacity onPress={() => setLabelsModalVisible(true)}>
            {labels.length > 0 ? (
              <Box style={styles.labelsRow}>
                <UTXOLabel labels={labels} center addMoreBtn />
              </Box>
            ) : (
              <Text color={`${colorMode}.textGreen`} style={styles.addLablesText} semiBold>
                + Add labels to your address
              </Text>
            )}
          </TouchableOpacity>
          <ReceiveQR qrValue={paymentURI || receivingAddress} qrSize={wp(windowWidth * 0.45)} />
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
            {colorMode === 'light' ? (
              <NavLeft width={wp(22)} height={hp(22)} />
            ) : (
              <NavLeftWhite width={wp(22)} height={hp(22)} />
            )}
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
            {colorMode === 'light' ? (
              <NavRight width={wp(22)} height={hp(22)} />
            ) : (
              <NavRightWhite width={wp(22)} height={hp(22)} />
            )}
          </TouchableOpacity>
        </HStack>
      </ScrollView>
      <Box style={styles.BottomContainer} backgroundColor={`${colorMode}.primaryBackground`}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text color={`${colorMode}.textGreen`} style={styles.addAmountText} semiBold>
            {home.requestSpecificAmount}
          </Text>
        </TouchableOpacity>
        {
          <Box>
            {wallet.entityKind === 'VAULT' && addVerifiableSigners?.length > 0 ? (
              <VerifyAddressBtn />
            ) : (
              <Box marginBottom={hp(84)}></Box>
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
      {labelsModalVisible && (
        <Pressable
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          backgroundColor="rgba(0, 0, 0, 0.5)"
          justifyContent="center"
          alignItems="center"
          onPress={() => {
            setLabelsModalVisible(false);
          }}
        >
          <Pressable
            width="90%"
            backgroundColor={`${colorMode}.primaryBackground`}
            borderRadius={10}
            style={styles.overlayContainer}
            onPress={() => {}}
          >
            <TouchableOpacity style={styles.close} onPress={() => setLabelsModalVisible(false)}>
              <Close />
            </TouchableOpacity>
            <Text color={`${colorMode}.primaryText`} style={styles.overlayTitle}>
              {walletTranslation.AddLabels}
            </Text>
            <Text color={`${colorMode}.secondaryText`} style={styles.overlaySubtitle}>
              {walletTranslation.AddLabelsReceiveSubtitle}
            </Text>
            {receivingAddress && (
              <LabelsEditor
                address={receivingAddress}
                wallet={wallet}
                onLabelsSaved={() => {
                  showToast(walletTranslation.LabelsSavedSuccessfully, <TickIcon />);
                  setLabelsModalVisible(false);
                }}
              />
            )}
            {addressUsed && (
              <Box
                style={styles.addressUsedLabelsWarning}
                backgroundColor={`${colorMode}.errorToastBackground`}
                borderColor={`${colorMode}.alertRed`}
              >
                <Box style={styles.addressUsedLabelsWarningIcon}>
                  {colorMode === 'light' ? <ErrorIcon /> : <ErrorDarkIcon />}
                </Box>
                <Text style={styles.addressUsedLabelsWarningText}>
                  {walletTranslation.addressAlreadyUsedLabelWarning}
                </Text>
              </Box>
            )}
          </Pressable>
        </Pressable>
      )}
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
    paddingVertical: hp(14),
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
    paddingTop: hp(17),
    paddingBottom: hp(10),
    borderRadius: 10,
    borderWidth: 1,
  },
  addAmountText: {
    fontSize: 14,
    width: '100%',
    textAlign: 'center',
    marginVertical: hp(20),
  },
  addressPagesBar: {
    marginTop: hp(5),
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
    marginTop: hp(20),
    flexDirection: 'row',
  },
  getNewAddressText: {
    fontSize: 14,
  },
  getNewAddressIcon: {
    marginLeft: wp(9),
    marginRight: wp(10),
    marginTop: hp(1),
  },
  addLablesText: {
    fontSize: 14,
    width: '100%',
    textAlign: 'center',
    marginTop: hp(10),
  },
  overlayContainer: {
    paddingTop: hp(30),
    paddingBottom: hp(50),
    paddingHorizontal: wp(15),
  },
  overlayTitle: {
    fontSize: 19,
    letterSpacing: 0.19,
    marginBottom: hp(5),
  },
  overlaySubtitle: {
    fontSize: 13,
    letterSpacing: 0.13,
    marginBottom: hp(15),
  },
  close: {
    width: '100%',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  labelsRow: {
    alignSelf: 'center',
    marginVertical: hp(1),
    width: '70%',
  },
  addressUsedLabelsWarning: {
    width: '97%',
    alignSelf: 'center',
    marginTop: hp(20),
    paddingVertical: hp(17),
    paddingHorizontal: hp(9),
    borderWidth: 0.5,
    borderRadius: 10,
    flexDirection: 'row',
  },
  addressUsedLabelsWarningText: {
    fontSize: 13,
    textAlign: 'left',
    width: '80%',
    marginLeft: wp(10),
  },
  addressUsedLabelsWarningIcon: {
    width: wp(30),
    height: hp(30),
    marginTop: hp(5),
    marginHorizontal: hp(2),
  },
});

export default ReceiveScreen;
