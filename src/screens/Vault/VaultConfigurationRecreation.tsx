import { Platform, StyleSheet, KeyboardAvoidingView } from 'react-native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Box, Input, ScrollView, View, useColorMode } from 'native-base';
import { hp, wp } from 'src/constants/responsive';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperHeader from 'src/components/KeeperHeader';
import Buttons from 'src/components/Buttons';
import useConfigRecovery from 'src/hooks/useConfigReocvery';
import ImportIcon from 'src/assets/images/import.svg';

import { RNCamera } from 'react-native-camera';
import { URRegistryDecoder } from 'src/services/qr/bc-ur-registry';
import { decodeURBytes } from 'src/services/qr';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import OptionCard from 'src/components/OptionCard';
import RNFS from 'react-native-fs';
import DocumentPicker, { types } from 'react-native-document-picker';
import Colors from 'src/theme/Colors';
import UploadImage from 'src/components/UploadImage';
import { ImageLibraryOptions, launchImageLibrary } from 'react-native-image-picker';
import useToastMessage from 'src/hooks/useToastMessage';
import Text from 'src/components/KeeperText';
import { QRreader } from 'react-native-qr-decode-image-camera';
import KeeperModal from 'src/components/KeeperModal';
import { useDispatch } from 'react-redux';
import { goToConcierge } from 'src/store/sagaActions/concierge';
import { ConciergeTag } from 'src/models/enums/ConciergeTag';
import { useFocusEffect } from '@react-navigation/native';
import CameraUnauthorized from 'src/components/CameraUnauthorized';

function WrappedImportIcon() {
  return (
    <View style={styles.iconWrapper}>
      <ImportIcon width={15} height={15} />
    </View>
  );
}

function VaultConfigurationCreation() {
  const { colorMode } = useColorMode();
  const [inputText, setInputText] = useState('');
  const { recoveryLoading, initateRecovery } = useConfigRecovery();

  const [qrPercent, setQrPercent] = useState(0);
  const [qrData, setData] = useState(0);
  const { translations } = useContext(LocalizationContext);
  const { showToast } = useToastMessage();
  let decoder = new URRegistryDecoder();
  const { common, importWallet } = translations;
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);

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
    setQrPercent(0);
  };

  useEffect(() => {
    if (qrData) {
      initateRecovery(qrData.toString());
      resetQR();
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
        setQrPercent(100);
      } else {
        const { data: qrInfo, percentage } = decodeURBytes(decoder, data.data);
        if (qrInfo) {
          setData(qrInfo);
        }
        setQrPercent(percentage);
      }
    }
  };

  const handleDocumentSelection = useCallback(async () => {
    try {
      const response = await DocumentPicker.pick({
        presentationStyle: 'fullScreen',
        type: [types.docx, types.allFiles],
        allowMultiSelection: false,
      });
      const content = await RNFS.readFile(response[0].uri, 'utf8');
      initateRecovery(content);
    } catch (err) {
      console.log(err);
    }
  }, []);

  const handleChooseImage = () => {
    const options = {
      quality: 1.0,
      maxWidth: 500,
      maxHeight: 500,
      storageOptions: {
        skipBackup: true,
      },
      mediaType: 'photo',
    } as ImageLibraryOptions;

    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        showToast('Camera device has been canceled');
      } else if (response.errorCode === 'camera_unavailable') {
        showToast('Camera not available on device');
      } else if (response.errorCode === 'permission') {
        showToast('Permission not satisfied');
      } else if (response.errorCode === 'others') {
        showToast(response.errorMessage);
      } else {
        QRreader(response.assets[0].uri)
          .then((data) => {
            onBarCodeRead({ data }, true);
          })
          .catch((err) => {
            showToast('Invalid or No related QR code');
          });
      }
    });
  };

  function ImportVaultContent() {
    return (
      <View marginY={5}>
        <Text style={styles.desc}>
          You can import a multisig wallet into Keeper if you have the BSMS file of that wallet.
        </Text>
        <Text style={styles.desc}>
          Please note that we are calling a BSMS file (also known as Output Descriptor), as the
          Wallet Configuration File within Keeper.
        </Text>
        <Text style={styles.desc}>
          If you are importing a vault that you had created in Keeper previously, note that only a
          specific vault will get imported. Not that complete Keeper app with all its wallets.
        </Text>
        <Text style={styles.descLast}>
          To import a complete Keeper app, please use that app’s Recovery Key.
        </Text>
      </View>
    );
  }

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        enabled
        keyboardVerticalOffset={Platform.select({ ios: 8, android: 500 })}
        style={styles.scrollViewWrapper}
      >
        <KeeperHeader
          title={importWallet.usingConfigFile}
          subtitle={importWallet.insertTextfromFile}
          learnMore
          learnTextColor={`${colorMode}.white`}
          learnMorePressed={() => setShowModal(true)}
        />
        <ScrollView style={styles.scrollViewWrapper} showsVerticalScrollIndicator={false}>
          <Box>
            <Box style={styles.qrcontainer}>
              {isFocused && (
                <RNCamera
                  style={styles.cameraView}
                  captureAudio={false}
                  onBarCodeRead={onBarCodeRead}
                  useNativeZoom
                  notAuthorizedView={<CameraUnauthorized />}
                />
              )}
            </Box>
            <Box style={styles.qrStatus}>
              <UploadImage
                backgroundColor={`${colorMode}.brownColor`}
                onPress={handleChooseImage}
              />
            </Box>
            <Box style={styles.optionsWrapper}>
              <Box style={styles.inputWrapper} backgroundColor={`${colorMode}.seashellWhite`}>
                <Input
                  testID="input_walletConfigurationFile"
                  placeholder="or enter configuration manually"
                  placeholderTextColor={`${colorMode}.primaryText`} // TODO: change to colorMode and use native base component
                  style={styles.textInput}
                  variant="unstyled"
                  value={inputText}
                  onChangeText={(text) => {
                    setInputText(text);
                  }}
                  textAlignVertical="top"
                  textAlign="left"
                  multiline
                />
              </Box>
              <Box style={styles.separator} backgroundColor={`${colorMode}.lightSkin`}></Box>
              <Box>
                <OptionCard
                  title="Upload a file"
                  description="Select a file from your storage locations"
                  LeftIcon={<WrappedImportIcon />}
                  callback={handleDocumentSelection}
                />
              </Box>
            </Box>
            <Box style={styles.buttonContainer}>
              <Buttons
                primaryCallback={() => initateRecovery(inputText)}
                primaryText={common.proceed}
                primaryLoading={recoveryLoading}
              />
            </Box>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
      <KeeperModal
        visible={showModal}
        close={() => {
          setShowModal(false);
        }}
        title="Import a wallet:"
        modalBackground={`${colorMode}.modalGreenBackground`}
        textColor={`${colorMode}.modalGreenContent`}
        Content={ImportVaultContent}
        DarkCloseIcon
        learnMore
        learnMoreTitle={common.needHelp}
        buttonText={common.ok}
        buttonTextColor={`${colorMode}.modalWhiteButtonText`}
        buttonBackground={`${colorMode}.modalWhiteButton`}
        buttonCallback={() => setShowModal(false)}
        learnMoreCallback={() => {
          setShowModal(false);
          dispatch(goToConcierge([ConciergeTag.WALLET], 'import-wallet-config-file'));
        }}
      />
    </ScreenWrapper>
  );
}

export default VaultConfigurationCreation;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  inputWrapper: {
    flexDirection: 'column',
    marginVertical: hp(20),
    marginHorizontal: hp(5),
    width: '100%',
    alignItems: 'center',
    borderRadius: 10,
  },
  textInput: {
    width: '100%',
    alignSelf: 'center',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    padding: 20,
    opacity: 0.5,
    fontSize: 13,
    height: hp(60),
  },

  tileContainer: {
    position: 'absolute',
    bottom: -50,
    width: '100%',
  },
  tileWrapper: {
    marginBottom: 15,
  },
  qrcontainer: {
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 15,
    alignItems: 'center',
    alignSelf: 'center',
  },
  cameraView: {
    height: hp(285),
    width: wp(330),
  },
  noteWrapper: {
    width: '100%',
    bottom: 0,
    position: 'absolute',
    paddingHorizontal: 20,
  },
  separator: {
    width: '100%',
    height: 2,
    backgroundColor: Colors.WhiteCoffee,
    marginBottom: 10,
  },
  optionsWrapper: {
    marginHorizontal: wp(15),
    alignContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    marginHorizontal: wp(15),

    marginTop: hp(20),
  },
  qrStatus: {
    position: 'absolute',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    transform: [{ translateY: hp(235) }],
  },
  scrollViewWrapper: {
    flex: 1,
  },
  desc: {
    color: 'white',
    fontSize: 13,
    letterSpacing: 0.65,
    padding: 5,
    marginBottom: hp(5),
  },
  descLast: {
    color: 'white',
    fontSize: 13,
    letterSpacing: 0.65,
    padding: 5,
    marginTop: hp(60),
  },
  iconWrapper: {
    width: wp(35),
    height: wp(35),
    marginLeft: -7,
    borderRadius: 20,
    backgroundColor: Colors.pantoneGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
