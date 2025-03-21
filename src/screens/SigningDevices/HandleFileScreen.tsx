import { Keyboard, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import React, { useState } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { Box, Input, useColorMode } from 'native-base';
import { Tile } from '../NewKeeperAppScreen/NewKeeperAppScreen';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import { exportFile, importFile } from 'src/services/fs';
import { SignerType } from 'src/services/wallets/enums';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import WalletHeader from 'src/components/WalletHeader';

const HandleFileScreen = ({ route, navigation }) => {
  const {
    title,
    subTitle,
    onFileExtract,
    ctaText,
    fileData = '',
    fileType = '',
    signerType,
  } = route.params;
  const [inputText, setInputText] = useState('');

  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();

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
        showToast('Please pick a valid file', <ToastErrorIcon />);
      },
      signerType === SignerType.KEYSTONE ? 'base64' : 'utf8'
    );
  };

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <View style={styles.wrapper}>
          <WalletHeader title={title} subTitle={subTitle} />
          <Box marginTop={hp(35)}>
            {fileData && (
              <Box style={styles.tileWrapper}>
                <Tile
                  title={fileType === 'PSBT' ? 'Export transaction file' : 'Export file'}
                  subTitle={fileType === 'PSBT' ? 'Export the PSBT file to sign' : 'to your phone'}
                  onPress={exportCallback}
                />
              </Box>
            )}
            <Box style={styles.tileWrapper}>
              <Tile
                title={fileType === 'PSBT' ? 'Import signed transaction file' : 'Import file'}
                subTitle={
                  fileType === 'PSBT' ? 'Import signed PSBT file into Keeper' : 'from your phone'
                }
                onPress={importCallback}
              />
            </Box>
            <Box style={styles.inputWrapper} backgroundColor={`${colorMode}.seashellWhite`}>
              <Input
                testID="input_container"
                placeholder="Manually enter the contents of the file to import"
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
                onFileExtract(inputText);
              }}
              primaryText={ctaText}
              primaryDisable={!inputText}
              fullWidth
            />
          </Box>
        </View>
      </TouchableWithoutFeedback>
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
  },
  footerWrapper: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    paddingHorizontal: '3%',
  },
});
