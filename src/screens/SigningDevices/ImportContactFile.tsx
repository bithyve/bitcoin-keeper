import { Keyboard, Pressable, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import React, { useState } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { Box, Input, useColorMode } from 'native-base';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import AddContactLight from 'src/assets/images/add-contact-light.svg';
import RightArrowLight from 'src/assets/images/icon_arrow.svg';
import RightArrowDark from 'src/assets/images/icon_arrow_white.svg';
import KeeperHeader from 'src/components/KeeperHeader';
import { hp, wp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import { importFile } from 'src/services/fs';
import { SignerType } from 'src/services/wallets/enums';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import Text from 'src/components/KeeperText';
import CircleIconWrapper from 'src/components/CircleIconWrapper';

const ImportContactFile = ({ route, navigation }) => {
  const { title, subTitle, onFileExtract, ctaText, signerType } = route.params;
  const [inputText, setInputText] = useState('');
  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();
  const isDarkMode = colorMode === 'dark';
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
                    selectionColor: Colors.SecondaryWhite,
                    cursorColor: Colors.SecondaryWhite,
                  }
                }
              />
            </Box>
            <Pressable onPress={importCallback}>
              <Box
                style={styles.buttonContainer}
                backgroundColor={`${colorMode}.seashellWhite`}
                borderColor={`${colorMode}.dullGreyBorder`}
              >
                <Box style={styles.buttonLeftContainer}>
                  <CircleIconWrapper
                    width={wp(39)}
                    icon={<AddContactLight />}
                    backgroundColor={`${colorMode}.pantoneGreen`}
                  />
                  <Text
                    color={`${colorMode}.primaryText`}
                    medium
                    numberOfLines={1}
                    style={styles.buttonText}
                  >
                    Add contact using file
                  </Text>
                </Box>
                <Box>{isDarkMode ? <RightArrowDark /> : <RightArrowLight />}</Box>
              </Box>
            </Pressable>
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
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: hp(16),
    paddingBottom: hp(15),
    paddingRight: wp(26),
    paddingLeft: wp(20),
  },
  buttonLeftContainer: {
    width: '75%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(12),
  },
  buttonRightContainer: {
    width: '25%',
    alignItems: 'center',
  },
  buttonText: {
    width: '75%',
  },
});
