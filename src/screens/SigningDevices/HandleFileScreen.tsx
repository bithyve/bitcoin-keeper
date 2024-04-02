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
import { hp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';

const HandleFileScreen = ({
  title,
  subTitle,
  onFileExtract,
  ctaText,
  signer,
  addSignerFlow,
  mode,
}) => {
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
              placeholderTextColor={`${colorMode}.primaryText`} // TODO: change to colorMode and use native base component
              style={styles.textInput}
              variant="unstyled"
              value={inputText}
              onChangeText={(text) => {
                setInputText(text);
              }}
              multiline
            />
          </Box>
          <Box style={styles.tileContainer}>
            <Box style={styles.tileWrapper}>
              <Tile title="Import a file" subTitle="From your phone" onPress={onFileImport} />
            </Box>
            <Buttons
              primaryCallback={() => onFileExtract(inputText)}
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
    flexDirection: 'column',
    marginVertical: hp(20),
    marginHorizontal: hp(5),
    width: '100%',
    alignItems: 'center',
    borderRadius: 10,
  },
  textInput: {
    width: '100%',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    padding: 20,
    opacity: 0.5,
    height: 150,
  },
  tileContainer: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
  },
  tileWrapper: {
    marginBottom: 15,
  },
});
