import { StyleSheet, TextInput } from 'react-native';
import { useColorMode, VStack } from 'native-base';
import React, { useCallback, useContext, useRef, useState } from 'react';

import { windowWidth } from 'src/constants/responsive';
import KeeperModal from 'src/components/KeeperModal';
import Colors from 'src/theme/Colors';
import Fonts from 'src/constants/Fonts';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import Text from 'src/components/KeeperText';

function Content({ descRef, errorText }: { descRef; errorText }) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;

  const updateDescription = useCallback((text) => {
    descRef.current = text.trim();
  }, []);
  return (
    <VStack style={styles.descriptionContainer}>
      <TextInput
        onChangeText={updateDescription}
        style={styles.descriptionEdit}
        placeholder={common.enterPassword}
        secureTextEntry
        placeholderTextColor={Colors.SecondaryBlack}
        defaultValue={''}
        maxLength={20}
      />
      {errorText && <Text color={`${colorMode}.alertRed`}>{errorText}</Text>}
    </VStack>
  );
}

function EnterPasswordModal({
  visible,
  close,
  callback,
}: {
  visible: boolean;
  close: () => void;
  callback: any;
}) {
  const { colorMode } = useColorMode();
  const descRef = useRef();
  const { translations } = useContext(LocalizationContext);
  const { common, vault: vaultText, error: errorStrings } = translations;
  const [errorText, setErrorText] = useState('');

  const MemoisedContent = React.useCallback(
    () => <Content descRef={descRef} errorText={errorText} />,
    [errorText]
  );
  const onSave = () => {
    if (!descRef.current || !(descRef?.current as string).trim().length) {
      setErrorText(errorStrings.passwordError);
      return;
    }
    callback(descRef.current);
    onClose();
  };

  const onClose = () => {
    close();
    setErrorText('');
    descRef.current = undefined;
  };

  return (
    <KeeperModal
      visible={visible}
      modalBackground={`${colorMode}.modalWhiteBackground`}
      textColor={`${colorMode}.textGreen`}
      subTitleColor={`${colorMode}.modalSubtitleBlack`}
      close={onClose}
      title={vaultText.enterPdfPassword}
      subTitle={vaultText.pdfPasswordDesc}
      buttonText={common.backup}
      Content={MemoisedContent}
      buttonCallback={onSave}
    />
  );
}

export default EnterPasswordModal;

const styles = StyleSheet.create({
  descriptionEdit: {
    height: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginVertical: 10,
    borderRadius: 10,
    width: windowWidth * 0.7,
    fontSize: 13,
    fontFamily: Fonts.InterBold,
    letterSpacing: 1,
    opacity: 0.5,
  },
  descriptionContainer: {
    width: windowWidth * 0.8,
  },
  limitTextWrapper: {
    width: windowWidth * 0.7,
    paddingHorizontal: 10,
    marginVertical: 10,
    alignItems: 'flex-end',
  },
  limitText: {
    fontSize: 12,
    letterSpacing: 0.6,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 30,
    backgroundColor: '#725436',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  name: {
    fontSize: 15,
    alignItems: 'center',
    letterSpacing: 1.12,
  },
});
