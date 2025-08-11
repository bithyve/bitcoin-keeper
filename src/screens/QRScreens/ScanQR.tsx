import { StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Box, Input, ScrollView, useColorMode } from 'native-base';
import React, { useContext, useState } from 'react';

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
import { ConciergeTag } from 'src/models/enums/ConciergeTag';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import QRScanner from 'src/components/QRScanner';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import Note from 'src/components/Note/Note';
import { SignerType } from 'src/services/wallets/enums';
import ConciergeNeedHelp from 'src/assets/images/conciergeNeedHelp.svg';
import WalletHeader from 'src/components/WalletHeader';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { InteracationMode } from '../Vault/HardwareModalMap';
import Instruction from 'src/components/Instruction';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';
import Buttons from 'src/components/Buttons';
import ShareDark from 'src/assets/images/share-white.svg';

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
    learnMoreContent = {},
    isPSBT = false,
    showNote = false,
    Illustration,
    Instructions,
    isSingning = false,
    contactShareData = null,
  } = route.params as any;

  const { translations } = useContext(LocalizationContext);
  const { common, signer: signerText, wallet: walletText, contactText } = translations;
  const { showToast } = useToastMessage();
  const [inputText, setInputText] = useState('');

  const { nfcVisible } = useNfcModal();
  const isDarkMode = colorMode === 'dark';
  const isHealthCheck = mode === InteracationMode.HEALTH_CHECK;
  const [infoModal, setInfoModal] = useState(false);

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
  const modalSubtitle = {
    [SignerType.COLDCARD]: signerText.coldCardModalSubtitle,
    [SignerType.KEYSTONE]: signerText.keyStoneModalSubtitle,
    [SignerType.SPECTER]: signerText.specterModalSubtitle,
    [SignerType.KEEPER]: signerText.keeperModalSubtitle,
  };

  const subtitleModal = modalSubtitle[type] || signerText.defaultModalSubtitle;

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
          <WalletHeader
            title={title}
            subTitle={subtitle}
            rightComponent={
              !isHealthCheck && !isSingning ? (
                <TouchableOpacity style={styles.infoIcon} onPress={() => setInfoModal(true)}>
                  <ThemedSvg name={'info_icon'} />
                </TouchableOpacity>
              ) : null
            }
          />
          <Box style={styles.container}>
            <ScrollView
              automaticallyAdjustKeyboardInsets={true}
              contentContainerStyle={{
                alignItems: 'center',
                paddingTop: hp(10),
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
            </ScrollView>
          </Box>
          {showNote && (
            <Box style={styles.noteWrapper}>
              <Note title={common.note} subtitle={common.scanQRNote} />
            </Box>
          )}
          {contactShareData && (
            <Box style={styles.noteWrapper}>
              <Buttons
                primaryText={contactText.shareContact}
                primaryCallback={() => {
                  navigation.navigate('ContactShareQr', { data: contactShareData });
                }}
                fullWidth
                LeftIcon={ShareDark}
              />
            </Box>
          )}
          <KeeperModal
            visible={visibleModal}
            close={() => {
              setVisibleModal(false);
            }}
            title={walletText.AddCoSigner}
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
          <KeeperModal
            visible={infoModal}
            close={() => {
              setInfoModal(false);
            }}
            title={title}
            subTitle={subtitleModal}
            modalBackground={`${colorMode}.modalWhiteBackground`}
            textColor={`${colorMode}.textGreen`}
            subTitleColor={`${colorMode}.modalSubtitleBlack`}
            Content={() => (
              <Box>
                <Box style={styles.illustration}>{Illustration}</Box>

                {Instructions?.map((instruction) => (
                  <Instruction text={instruction} key={instruction} />
                ))}
              </Box>
            )}
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
  infoIcon: {
    marginRight: wp(10),
  },
  illustration: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(20),
  },
});
