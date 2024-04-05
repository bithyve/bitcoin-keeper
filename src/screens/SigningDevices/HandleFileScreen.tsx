import { Keyboard, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import React, { useState } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { Box, Input, useColorMode } from 'native-base';
import { Tile } from '../NewKeeperAppScreen/NewKeeperAppScreen';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import { captureError } from 'src/services/sentry';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import KeeperHeader from 'src/components/KeeperHeader';
import { hp, windowWidth } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';

const HandleFileScreen = ({ route, navigation }) => {
  const { title, subTitle, onFileExtract, ctaText } = route.params;
  const [inputText, setInputText] = useState('');

  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();

  const onFileImport = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      try {
        const filePath = result[0].uri.split('%20').join(' ');
        const fileExtract = await RNFS.readFile(filePath);
        setInputText(fileExtract);
      } catch (err) {
        captureError(err);
        showToast('Please pick a valid file', <ToastErrorIcon />);
      }
    } catch (err) {
      if (err.toString().includes('user canceled')) {
        // user cancelled
        return;
      }
      captureError(err);
      showToast('Something went wrong.', <ToastErrorIcon />);
    }
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
            />
          </Box>
          <Box style={styles.tileWrapper}>
            <Tile title="Import a file" subTitle="From your phone" onPress={onFileImport} />
          </Box>
          <Box style={styles.footerWrapper}>
            <Buttons
              primaryCallback={() => {
                navigation.goBack();
                onFileExtract(inputText);
              }}
              primaryText={ctaText}
              primaryDisable={!inputText}
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
  },
});
