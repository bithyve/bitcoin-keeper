import { StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Box, Input, ScrollView, useColorMode } from 'native-base';
import React, { useContext, useState } from 'react';

import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { URRegistryDecoder } from 'src/services/qr/bc-ur-registry';
import { decodeURBytes } from 'src/services/qr';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import useToastMessage from 'src/hooks/useToastMessage';
import { hp, windowWidth, wp } from 'src/constants/responsive';

import useNfcModal from 'src/hooks/useNfcModal';
import MockWrapper from 'src/screens/Vault/MockWrapper';
import KeeperModal from 'src/components/KeeperModal';
import { useDispatch } from 'react-redux';
import { ConciergeTag } from 'src/models/enums/ConciergeTag';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import QRScanner from 'src/components/QRScanner';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import NFCOption from '../NFCChannel/NFCOption';
import Note from 'src/components/Note/Note';
import { SignerType } from 'src/services/wallets/enums';
import ConciergeNeedHelp from 'src/assets/images/conciergeNeedHelp.svg';

const decoder = new URRegistryDecoder();

function ScanQR() {
  const navigation = useNavigation();
  const { colorMode } = useColorMode();
  const [visibleModal, setVisibleModal] = useState(false);
  const route = useRoute();
  const {
    title = '',
    subtitle = '',
    onQrScan = () => {},
    setup = false,
    type,
    mode,
    signer,
    disableMockFlow = false,
    addSignerFlow = false,
    learnMore = false,
    learnMoreContent = {},
    isPSBT = false,
    importOptions = true,
    showNote = false,
  } = route.params as any;

  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();
  const [inputText, setInputText] = useState('');

  const { nfcVisible, closeNfc, withNfcModal } = useNfcModal();

  const onTextSubmit = (data) => {
    if (!data.startsWith('UR') && !data.startsWith('ur')) {
      onQrScan(data);
    } else {
      try {
        const { data: qrInfo } = decodeURBytes(decoder, data);
        if (qrInfo) {
          onQrScan(qrInfo);
        }
      } catch {
        showToast('Invalid data submitted', <ToastErrorIcon />);
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} testID={`scanQr`}>
      <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
        <MockWrapper
          signerType={type}
          enable={setup && type && !disableMockFlow}
          addSignerFlow={addSignerFlow}
          signerXfp={signer?.masterFingerprint}
          mode={mode}
        >
          <KeeperHeader
            title={title}
            subtitle={subtitle}
            subTitleWidth={windowWidth * 0.7}
            learnMore={learnMore}
            learnMorePressed={() => {
              setVisibleModal(true);
            }}
            learnTextColor={`${colorMode}.buttonText`}
          />
          <Box style={styles.container}>
            <ScrollView
              automaticallyAdjustKeyboardInsets={true}
              contentContainerStyle={{
                alignItems: 'center',
                paddingTop: hp(30),
              }}
              style={styles.flex1}
              showsVerticalScrollIndicator={false}
            >
              <QRScanner onScanCompleted={onQrScan} hideCamera={nfcVisible} />
              {isPSBT && (
                <Box style={styles.inputContainer}>
                  <Box
                    style={styles.inputWrapper}
                    backgroundColor={`${colorMode}.seashellWhite`}
                    borderColor={`${colorMode}.greyBorder`}
                  >
                    <Input
                      placeholder="or paste PSBT text"
                      placeholderTextColor={`${colorMode}.primaryText`}
                      style={styles.textInput}
                      variant="unstyled"
                      value={inputText}
                      onChangeText={(text) => {
                        setInputText(text);
                      }}
                      onSubmitEditing={() => {
                        onTextSubmit(inputText);
                      }}
                      textAlignVertical="top"
                      textAlign="left"
                      multiline
                      width={windowWidth * 0.8}
                      blurOnSubmit={false}
                      onKeyPress={({ nativeEvent }) => {
                        if (nativeEvent.key === 'Enter') {
                          onTextSubmit(inputText);
                        }
                      }}
                      _input={
                        colorMode === 'dark' && {
                          selectionColor: Colors.bodyText,
                          cursorColor: Colors.bodyText,
                        }
                      }
                    />
                  </Box>
                </Box>
              )}
              {importOptions && type != SignerType.COLDCARD && (
                <Box style={styles.importOptions}>
                  <NFCOption
                    signerType={type}
                    nfcVisible={nfcVisible}
                    closeNfc={closeNfc}
                    withNfcModal={withNfcModal}
                    setData={onQrScan}
                    isPSBT={isPSBT}
                  />
                </Box>
              )}
            </ScrollView>
          </Box>
          {showNote && (
            <Box style={styles.noteWrapper}>
              <Note title={common.note} subtitle={common.scanQRNote} />
            </Box>
          )}
          <KeeperModal
            visible={visibleModal}
            close={() => {
              setVisibleModal(false);
            }}
            title="Add a co-signer"
            subTitle=""
            modalBackground={`${colorMode}.pantoneGreen`}
            textColor={`${colorMode}.headerWhite`}
            Content={learnMoreContent}
            buttonText={common.Okay}
            secondaryButtonText={common.needHelp}
            buttonTextColor={`${colorMode}.pantoneGreen`}
            buttonBackground={`${colorMode}.whiteSecButtonText`}
            secButtonTextColor={`${colorMode}.whiteSecButtonText`}
            secondaryIcon={<ConciergeNeedHelp />}
            buttonCallback={() => {
              setVisibleModal(false);
            }}
            secondaryCallback={() => {
              setVisibleModal(false);
              navigation.dispatch(
                CommonActions.navigate({
                  name: 'CreateTicket',
                  params: {
                    tags: [ConciergeTag.COLLABORATIVE_Wallet],
                    screenName: 'add-co-signer',
                  },
                })
              );
            }}
            learnMoreButtonText={common.needMoreHelp}
          />
        </MockWrapper>
      </ScreenWrapper>
    </TouchableWithoutFeedback>
  );
}

export default ScanQR;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  flex1: {
    flex: 1,
  },
  uploadButton: {
    position: 'absolute',
    zIndex: 999,
    justifyContent: 'center',
  },
  inputContainer: {
    marginHorizontal: hp(10),
    marginTop: hp(10),
  },
  inputWrapper: {
    flexDirection: 'column',
    height: hp(100),
    marginBottom: hp(20),
    width: '100%',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 0.5,
  },
  textInput: {
    alignSelf: 'center',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    padding: 20,
    opacity: 0.5,
    fontSize: 13,
    height: hp(60),
  },
  importOptions: {
    marginTop: hp(10),
    justifyContent: 'center',
    alignItems: 'center',
    width: windowWidth * 0.8,
  },
  noteWrapper: {
    paddingHorizontal: wp(15),
  },
});
