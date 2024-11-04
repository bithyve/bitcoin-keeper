import { Keyboard, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import React, { useState } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { Box, Input, useColorMode } from 'native-base';
import { Tile } from '../NewKeeperAppScreen/NewKeeperAppScreen';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import KeeperHeader from 'src/components/KeeperHeader';
import { hp, windowWidth } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import { exportFile, importFile } from 'src/services/fs';
import { SignerType } from 'src/services/wallets/enums';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const HandleFileScreen = ({ route, navigation }) => {
  const { title, subTitle, onFileExtract, ctaText, fileData = '', signerType } = route.params;
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
          <KeeperHeader title={title} subtitle={subTitle} />
          <Box style={styles.inputWrapper} backgroundColor={`${colorMode}.seashellWhite`}>
            <Input
              testID="input_container"
              placeholder="Enter the contents of the file"
              placeholderTextColor={'grey'}
              style={styles.textInput}
              variant="unstyled"
              value={inputText}
              onChangeText={(text) => {
                setInputText(text);
              }}
              multiline
              _input={
                colorMode === 'dark' && {
                  selectionColor: Colors.SecondaryWhite,
                  cursorColor: Colors.SecondaryWhite,
                }
              }
            />
          </Box>
          <Box style={styles.tileWrapper}>
            <Tile title="Import a file" subTitle="From your phone" onPress={importCallback} />
          </Box>
          <Box style={styles.footerWrapper}>
            <Buttons
              secondaryText={fileData ? 'Export File' : ''}
              secondaryCallback={exportCallback}
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
    marginHorizontal: windowWidth * 0.1 - 20,
    width: windowWidth * 0.8,
    marginTop: hp(30),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  textInput: {
    width: '100%',
    padding: 20,
    height: 150,
  },
  tileWrapper: {
    marginBottom: 15,
    marginHorizontal: windowWidth * 0.1 - 20,
    width: windowWidth * 0.8,
  },
  footerWrapper: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    paddingHorizontal: '3%',
  },
});
