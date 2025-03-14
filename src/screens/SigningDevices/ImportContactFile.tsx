import { Keyboard, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import React, { useState } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { Box, Input, useColorMode } from 'native-base';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import AddContactLight from 'src/assets/images/add-contact-light.svg';
import KeeperHeader from 'src/components/KeeperHeader';
import { hp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import { importFile } from 'src/services/fs';
import { SignerType } from 'src/services/wallets/enums';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import MenuOption from 'src/components/MenuOption';

const ImportContactFile = ({ route, navigation }) => {
  const { title, subTitle, onFileExtract, ctaText, signerType } = route.params;
  const [inputText, setInputText] = useState('');
  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();
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
          <Box style={styles.contentContainer}>
            <Box style={styles.inputWrapper} backgroundColor={`${colorMode}.seashellWhite`}>
              <Input
                testID="input_container"
                placeholder="Enter contents of the file"
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
            <MenuOption
              title="Add contact using file"
              Icon={<AddContactLight />}
              callback={importCallback}
            />
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

export default ImportContactFile;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  contentContainer: {
    width: '95%',
    alignSelf: 'center',
    gap: hp(25),
    marginTop: hp(33),
  },
  inputWrapper: {
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
  footerWrapper: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    paddingHorizontal: '3%',
  },
});
