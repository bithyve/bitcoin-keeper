import { Platform, StyleSheet, KeyboardAvoidingView } from 'react-native';
import React, { useCallback, useContext, useState } from 'react';
import { Box, Input, ScrollView, View, useColorMode } from 'native-base';
import { hp, wp } from 'src/constants/responsive';
import ScreenWrapper from 'src/components/ScreenWrapper';
import Buttons from 'src/components/Buttons';
import useConfigRecovery from 'src/hooks/useConfigReocvery';
import ImportIcon from 'src/assets/images/import.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import OptionCard from 'src/components/OptionCard';
import RNFS from 'react-native-fs';
import DocumentPicker, { types } from 'react-native-document-picker';
import Colors from 'src/theme/Colors';
import QRScanner from 'src/components/QRScanner';
import WalletHeader from 'src/components/WalletHeader';

function WrappedImportIcon() {
  return (
    <View style={styles.iconWrapper}>
      <ImportIcon width={15} height={15} />
    </View>
  );
}

function PassportConfigRecovery() {
  const { colorMode } = useColorMode();
  const [inputText, setInputText] = useState('');
  const { recoveryLoading, initateRecovery } = useConfigRecovery();

  const { translations } = useContext(LocalizationContext);
  const { common, importWallet, signer: signerTranslation } = translations;

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

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        enabled
        keyboardVerticalOffset={Platform.select({ ios: 8, android: 500 })}
        style={styles.scrollViewWrapper}
      >
        <WalletHeader
          title={signerTranslation.recoverUsingConfig}
          subTitle={importWallet.insertTextfromFile}
        />
        <ScrollView style={styles.scrollViewWrapper} showsVerticalScrollIndicator={false}>
          <Box>
            <QRScanner onScanCompleted={initateRecovery} />
            <Box style={styles.optionsWrapper}>
              <Box style={styles.inputWrapper} backgroundColor={`${colorMode}.seashellWhite`}>
                <Input
                  testID="input_walletConfigurationFile"
                  placeholder={signerTranslation.enterManualConfig}
                  placeholderTextColor={`${colorMode}.primaryText`}
                  style={styles.textInput}
                  variant="unstyled"
                  value={inputText}
                  onChangeText={(text) => {
                    setInputText(text);
                  }}
                  textAlignVertical="top"
                  textAlign="left"
                  multiline
                  _input={
                    colorMode === 'dark' && {
                      selectionColor: Colors.bodyText,
                      cursorColor: Colors.bodyText,
                    }
                  }
                />
              </Box>
              <Box style={styles.separator} backgroundColor={`${colorMode}.lightSkin`}></Box>
              <Box>
                <OptionCard
                  title={signerTranslation.uploadFile}
                  description={signerTranslation.uploadFileDesc}
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
    </ScreenWrapper>
  );
}

export default PassportConfigRecovery;

const styles = StyleSheet.create({
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
  separator: {
    width: '100%',
    height: 2,
    backgroundColor: Colors.secondaryCreamWhite,
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
  scrollViewWrapper: {
    flex: 1,
  },
  iconWrapper: {
    width: wp(35),
    height: wp(35),
    marginLeft: -7,
    borderRadius: 20,
    backgroundColor: Colors.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
