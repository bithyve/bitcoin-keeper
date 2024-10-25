import { StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Box, Input, ScrollView, VStack, useColorMode } from 'native-base';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { QRreader } from 'react-native-qr-decode-image-camera';

import KeeperHeader from 'src/components/KeeperHeader';
import { RNCamera } from 'react-native-camera';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { URRegistryDecoder } from 'src/services/qr/bc-ur-registry';
import { decodeURBytes } from 'src/services/qr';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { ImageLibraryOptions, launchImageLibrary } from 'react-native-image-picker';
import useToastMessage from 'src/hooks/useToastMessage';
import UploadImage from 'src/components/UploadImage';
import { hp, windowWidth } from 'src/constants/responsive';
import CameraUnauthorized from 'src/components/CameraUnauthorized';

import useNfcModal from 'src/hooks/useNfcModal';
import { globalStyles } from 'src/constants/globalStyles';
import MockWrapper from 'src/screens/Vault/MockWrapper';
import NFCOption from '../NFCChannel/NFCOption';
import { InteracationMode } from '../Vault/HardwareModalMap';
import KeeperModal from 'src/components/KeeperModal';
import { useDispatch } from 'react-redux';
import { goToConcierge } from 'src/store/sagaActions/concierge';
import { ConciergeTag } from 'src/models/enums/ConciergeTag';
import useIsSmallDevices from 'src/hooks/useSmallDevices';

let decoder = new URRegistryDecoder();

function ScanQR() {
  const { colorMode } = useColorMode();
  const [qrData, setData] = useState(0);
  const [visibleModal, setVisibleModal] = useState(false);
  const route = useRoute();
  const { showToast } = useToastMessage();
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
  } = route.params as any;

  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const dispatch = useDispatch();
  const [inputText, setInputText] = useState('');
  const isSmallDevice = useIsSmallDevices();

  const { nfcVisible, closeNfc, withNfcModal } = useNfcModal();

  const [isFocused, setIsFocused] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => {
        setIsFocused(false);
      };
    }, [])
  );
  // eslint-disable-next-line no-promise-executor-return
  const sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const resetQR = async () => {
    await sleep(3000);
    setData(0);
  };

  useEffect(() => {
    if (qrData) {
      if (mode === InteracationMode.HEALTH_CHECK) {
        onQrScan(qrData, resetQR, signer);
      } else {
        onQrScan(qrData, resetQR);
      }
    }
    return () => {
      decoder = new URRegistryDecoder();
    };
  }, [qrData]);

  const onBarCodeRead = (data, fromImage = false) => {
    if (
      !qrData &&
      data.data &&
      (data.type === 'QR_CODE' || data.type === 'org.iso.QRCode' || fromImage)
    ) {
      if (!data.data.startsWith('UR') && !data.data.startsWith('ur')) {
        setData(data.data);
      } else {
        const { data: qrInfo } = decodeURBytes(decoder, data.data);
        if (qrInfo) {
          setData(qrInfo);
        }
      }
    }
  };

  const handleChooseImage = () => {
    const options = {
      quality: 1.0,
      maxWidth: 500,
      maxHeight: 500,
      storageOptions: { skipBackup: true },
      mediaType: 'photo',
    } as ImageLibraryOptions;

    launchImageLibrary(options, async (response) => {
      try {
        if (response.didCancel) {
          // ignore if user canceled the process
        } else if (response.errorCode === 'camera_unavailable') {
          showToast('Camera not available on device');
        } else if (response.errorCode === 'permission') {
          showToast('Permission not satisfied');
        } else if (response.errorCode === 'others') {
          showToast(response.errorMessage);
        } else {
          const data = await QRreader(response.assets[0].uri);
          onBarCodeRead({ data }, true);
        }
      } catch (_) {
        showToast('Invalid or No related QR code');
      }
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
            learnTextColor={`${colorMode}.white`}
          />
          <ScrollView
            automaticallyAdjustKeyboardInsets={true}
            contentContainerStyle={{
              flex: 1,
              alignItems: 'center',
            }}
            showsVerticalScrollIndicator={false}
          >
            <VStack style={globalStyles.centerColumn}>
              <Box style={styles.qrcontainer}>
                {!nfcVisible && isFocused ? (
                  <RNCamera
                    autoFocus="on"
                    style={styles.cameraView}
                    captureAudio={false}
                    onBarCodeRead={onBarCodeRead}
                    useNativeZoom
                    notAuthorizedView={<CameraUnauthorized />}
                  />
                ) : (
                  <Box style={styles.cameraView} />
                )}
              </Box>
              <Box style={[styles.uploadButton, { top: isSmallDevice ? hp(295) : hp(240) }]}>
                <UploadImage
                  backgroundColor={`${colorMode}.brownColor`}
                  onPress={handleChooseImage}
                />
              </Box>
            </VStack>
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
                      onBarCodeRead({ data: inputText }, true);
                    }}
                    textAlignVertical="top"
                    textAlign="left"
                    multiline
                    width={windowWidth * 0.8}
                    blurOnSubmit={false}
                    onKeyPress={({ nativeEvent }) => {
                      if (nativeEvent.key === 'Enter') {
                        onBarCodeRead({ data: inputText }, true);
                      }
                    }}
                  />
                </Box>
              </Box>
            )}
            <Box style={styles.importOptions}>
              <NFCOption
                signerType={type}
                nfcVisible={nfcVisible}
                closeNfc={closeNfc}
                withNfcModal={withNfcModal}
                setData={setData}
                isPSBT={isPSBT}
              />
            </Box>
          </ScrollView>
          <KeeperModal
            visible={visibleModal}
            close={() => {
              setVisibleModal(false);
            }}
            title={'Add a co-signer'}
            subTitle={''}
            modalBackground={`${colorMode}.modalGreenBackground`}
            textColor={`${colorMode}.modalGreenContent`}
            Content={learnMoreContent}
            buttonText={common.Okay}
            secondaryButtonText={common.needHelp}
            buttonTextColor={`${colorMode}.modalWhiteButtonText`}
            buttonBackground={`${colorMode}.modalWhiteButton`}
            secButtonTextColor={`${colorMode}.modalGreenSecButtonText`}
            buttonCallback={() => {
              setVisibleModal(false);
            }}
            secondaryCallback={() => {
              setVisibleModal(false);
              dispatch(goToConcierge([ConciergeTag.COLLABORATIVE_Wallet], 'add-co-signer'));
            }}
            learnMoreTitle={common.needMoreHelp}
            buttonCallback={() => setVisibleModal(false)}
            buttonBackground={`${colorMode}.modalWhiteButton`}
          />
        </MockWrapper>
      </ScreenWrapper>
    </TouchableWithoutFeedback>
  );
}

export default ScanQR;

const styles = StyleSheet.create({
  qrcontainer: {
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 25,
    alignItems: 'center',
  },
  cameraView: {
    height: windowWidth * 0.7,
    width: windowWidth * 0.8,
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
});
