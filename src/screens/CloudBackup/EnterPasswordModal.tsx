import { StyleSheet, TextInput } from 'react-native';
import { Box, useColorMode, VStack } from 'native-base';
import React, { useCallback, useRef } from 'react';

import { windowWidth } from 'src/constants/responsive';
import KeeperModal from 'src/components/KeeperModal';
import Colors from 'src/theme/Colors';
import Fonts from 'src/constants/Fonts';

function Content({ descRef }: { descRef }) {
  const { colorMode } = useColorMode();

  const updateDescription = useCallback((text) => {
    descRef.current = text.trim();
  }, []);
  return (
    <VStack style={styles.descriptionContainer}>
      <TextInput
        onChangeText={updateDescription}
        style={styles.descriptionEdit}
        placeholder="Enter Password"
        secureTextEntry
        placeholderTextColor={Colors.RichBlack}
        defaultValue={''}
        maxLength={20}
      />
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
  const MemoisedContent = React.useCallback(() => <Content descRef={descRef} />, []);
  const onSave = () => {
    close();
    callback(descRef.current);
  };
  return (
    <KeeperModal
      visible={visible}
      modalBackground={`${colorMode}.modalWhiteBackground`}
      textColor={`${colorMode}.primaryText`}
      subTitleColor={`${colorMode}.secondaryText`}
      DarkCloseIcon={colorMode === 'dark'}
      close={close}
      title="Enter PDF File Password"
      subTitle="Secure your BSMS PDF files by protecting them with a password of your choice."
      buttonText="Backup"
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
    fontFamily: Fonts.FiraSansBold,
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
