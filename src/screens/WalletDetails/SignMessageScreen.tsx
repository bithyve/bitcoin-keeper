import { Box, Input, KeyboardAvoidingView, ScrollView, useColorMode } from 'native-base';
import React, { useContext, useState } from 'react';
import { Text, StyleSheet, Platform } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import Buttons from 'src/components/Buttons';
import KeeperTextInput from 'src/components/KeeperTextInput';
import ScreenWrapper from 'src/components/ScreenWrapper';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';
import WalletHeader from 'src/components/WalletHeader';
import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import useIsSmallDevices from 'src/hooks/useSmallDevices';
import useToastMessage from 'src/hooks/useToastMessage';
import KeeperModal from 'src/components/KeeperModal';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { useAppSelector } from 'src/store/hooks';
import WalletOperations from 'src/services/wallets/operations';

export const SignMessageScreen = ({ route }) => {
  const wallet = route.params?.wallet;
  const { xpriv, addresses } = wallet.specs;
  const receiveAddressCache = addresses?.external;

  const { colorMode } = useColorMode();
  const [message, setMessage] = useState('');
  const [address, setAddress] = useState('');
  const [signature, setSignature] = useState('');
  const [verifiedModal, setVerifiedModal] = useState(false);
  const isSmallDevice = useIsSmallDevices();
  const { common, wallet: walletText } = useContext(LocalizationContext).translations;
  const { showToast } = useToastMessage();
  const { bitcoinNetwork } = useAppSelector((state) => state.settings);

  const onSignMessage = () => {
    if (!message) return showToast('Please enter the message');
    try {
      const { signature, messageAddress } = WalletOperations.signMessageWallet(
        address,
        message,
        bitcoinNetwork,
        xpriv,
        receiveAddressCache
      );
      setSignature(signature);
      setAddress(messageAddress);
    } catch (error) {
      console.log('🚀 ~ onSignMessage ~ error:', error);
      showToast(error.message);
    }
  };

  const onVerifyMessage = () => {
    if (!message || !address || !signature)
      return showToast('Please provide message, address and signature for verification');
    try {
      const valid = WalletOperations.verifySignedMessage(
        message,
        address,
        signature,
        bitcoinNetwork
      );
      if (valid) setVerifiedModal(true);
    } catch (error) {
      console.log('🚀 ~ onVerifyMessage ~ error:', error);
      showToast(`Signature is not valid for the provided message`, <ToastErrorIcon />);
    }
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        enabled
        keyboardVerticalOffset={Platform.select({ ios: 8, android: 500 })}
        style={styles.scrollViewWrapper}
      >
        <Box style={styles.header}>
          <WalletHeader title={'Sign/Verify Message'} />
        </Box>

        <ScrollView
          style={styles.scrollViewWrapper}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={isSmallDevice && { paddingBottom: hp(100) }}
        >
          <Text>The Wallet configuration file is used restore the wallet on other devices.</Text>

          <KeeperTextInput
            testID="input_receive_address"
            placeholder={common.Address}
            inpuBackgroundColor={`${colorMode}.textInputBackground`}
            inpuBorderColor={`${colorMode}.dullGreyBorder`}
            height={50}
            value={address}
            onChangeText={setAddress}
            blurOnSubmit={true}
            paddingLeft={5}
          />

          <Box
            style={styles.inputWrapper}
            backgroundColor={`${colorMode}.seashellWhite`}
            borderColor={`${colorMode}.dullGreyBorder`}
          >
            <Input
              testID="input_container"
              placeholder={common.message}
              placeholderTextColor={`${colorMode}.placeHolderTextColor`}
              style={styles.textInput}
              variant="unstyled"
              value={message}
              onChangeText={setMessage}
              multiline
              _input={
                colorMode === 'dark' && {
                  selectionColor: Colors.bodyText,
                  cursorColor: Colors.bodyText,
                }
              }
            />
          </Box>

          <Box
            style={styles.inputWrapper}
            backgroundColor={`${colorMode}.seashellWhite`}
            borderColor={`${colorMode}.dullGreyBorder`}
          >
            <Input
              testID="input_container"
              placeholder={common.signature}
              placeholderTextColor={`${colorMode}.placeHolderTextColor`}
              style={styles.textInput}
              variant="unstyled"
              value={signature}
              onChangeText={setSignature}
              multiline
              _input={
                colorMode === 'dark' && {
                  selectionColor: Colors.bodyText,
                  cursorColor: Colors.bodyText,
                }
              }
            />
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
      <Box backgroundColor={`${colorMode}.primaryBackground`}>
        <Buttons
          primaryCallback={onSignMessage}
          primaryText={common.sign}
          secondaryText={common.verify}
          secondaryCallback={onVerifyMessage}
        />
      </Box>
      <KeeperModal
        visible={verifiedModal}
        title={walletText.messageVerifiedTitle}
        subTitle={walletText.messageVerifiedSubTitle}
        close={() => setVerifiedModal(false)}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        buttonText={common.close}
        buttonCallback={() => setVerifiedModal(false)}
        Content={() => <Box>{/* Illustration */}</Box>}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollViewWrapper: {
    flex: 1,
  },
  header: {
    marginBottom: 18,
  },
  inputWrapper: {
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: hp(15),
    paddingHorizontal: hp(10),
    borderWidth: 1,
  },
  textInput: {
    width: '100%',
    height: hp(110),
    fontSize: 12,
  },
});
