import { Keyboard, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import React, { useContext, useState } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { Box, Input, useColorMode } from 'native-base';
import { Tile } from '../NewKeeperAppScreen/NewKeeperAppScreen';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import { exportFile, importFile } from 'src/services/fs';
import { SignerType } from 'src/services/wallets/enums';
import WalletHeader from 'src/components/WalletHeader';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Instruction from 'src/components/Instruction';
import KeeperModal from 'src/components/KeeperModal';
import Colors from 'src/theme/Colors';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { manipulateKruxSingleFile } from 'src/hardware/krux';

const HandleFileScreen = ({ route, navigation }) => {
  const {
    title,
    subTitle,
    onFileExtract,
    ctaText,
    fileData = '',
    fileType = '',
    signerType,
    isHealthcheck,
    Illustration,
    Instructions,
    signingMode,
  } = route.params;
  const [inputText, setInputText] = useState('');

  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const { showToast } = useToastMessage();
  const [infoModal, setInfoModal] = useState(false);
  const { translations } = useContext(LocalizationContext);
  const { error: errorText, coldcard, signer: signerText, externalKey } = translations;

  const exportCallback = () =>
    exportFile(fileData, `keeper-${Date.now()}.psbt`, (error) =>
      showToast(error.message, <ToastErrorIcon />)
    );

  const importCallback = () => {
    importFile(
      (data) => {
        setInputText(data);
      },
      (_) => {
        showToast(errorText.pickValidFile, <ToastErrorIcon />);
      },
      signerType === SignerType.KEYSTONE ? 'base64' : 'utf8'
    );
  };
  const modalSubtitle = {
    [SignerType.COLDCARD]: coldcard.setupColdcard,
    [SignerType.KEYSTONE]: signerText.keyStoneModalSubtitle,
    [SignerType.KEEPER]: externalKey.modalSubtitle,
  };

  const subtitleModal = modalSubtitle[signerType] || signerText.defaultSetup;

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <View style={styles.wrapper}>
          <WalletHeader
            title={title}
            subTitle={subTitle}
            rightComponent={
              !isHealthcheck && !signingMode ? (
                <TouchableOpacity style={styles.infoIcon} onPress={() => setInfoModal(true)}>
                  <ThemedSvg name={'info_icon'} />
                </TouchableOpacity>
              ) : null
            }
          />
          <Box marginTop={hp(35)}>
            {fileData && (
              <Box style={styles.tileWrapper}>
                <Tile
                  title={
                    fileType === 'PSBT' ? signerText.exportTransactionFile : signerText.exportFile
                  }
                  subTitle={
                    fileType === 'PSBT' ? signerText.exportPsbtToSign : signerText.toYourPhone
                  }
                  onPress={exportCallback}
                />
              </Box>
            )}
            <Box style={styles.tileWrapper}>
              <Tile
                title={
                  fileType === 'PSBT' ? signerText.signedTransactionFile : signerText.importFile
                }
                subTitle={
                  fileType === 'PSBT' ? signerText.importPsbtFile : signerText.fromYourPhone
                }
                onPress={importCallback}
              />
            </Box>
            <Box style={styles.inputWrapper} backgroundColor={`${colorMode}.seashellWhite`}>
              <Input
                testID="input_container"
                placeholder={signerText.manuallyEnterContent}
                placeholderTextColor={`${colorMode}.placeHolderTextColor`}
                style={styles.textInput}
                variant="unstyled"
                value={inputText}
                onChangeText={(text) => {
                  setInputText(text);
                }}
                multiline
                _input={
                  colorMode === 'dark' && {
                    selectionColor: Colors.bodyText,
                    cursorColor: Colors.bodyText,
                  }
                }
              />
            </Box>
          </Box>
          <Box style={styles.footerWrapper}>
            <Buttons
              primaryCallback={() => {
                navigation.goBack();
                signerType === SignerType.KRUX && isHealthcheck
                  ? manipulateKruxSingleFile(inputText, onFileExtract)
                  : onFileExtract(inputText);
              }}
              primaryText={ctaText}
              primaryDisable={!inputText}
              fullWidth
            />
          </Box>
        </View>
      </TouchableWithoutFeedback>
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
    </ScreenWrapper>
  );
};

export default HandleFileScreen;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  inputWrapper: {
    width: windowWidth * 0.85,
    marginTop: hp(10),
    marginLeft: wp(7),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: hp(15),
    paddingHorizontal: hp(10),
    borderColor: Colors.separator,
    borderWidth: 1,
  },
  textInput: {
    width: '100%',
    height: hp(110),
    fontSize: 11,
  },
  tileWrapper: {
    marginBottom: hp(15),
    marginLeft: wp(7),
    width: windowWidth * 0.85,
    borderWidth: 1,
    borderColor: Colors.separator,
    borderRadius: 10,
  },
  footerWrapper: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    paddingHorizontal: '3%',
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
