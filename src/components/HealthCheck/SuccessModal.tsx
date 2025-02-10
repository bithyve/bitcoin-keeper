import Text from 'src/components/KeeperText';
import { Modal, View, Box, useColorMode } from 'native-base';
import { StyleSheet, TouchableOpacity, Platform } from 'react-native';

import React from 'react';
import { wp } from 'src/constants/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Close from 'src/assets/images/modal_close.svg';

function SuccessModal(props) {
  const { colorMode } = useColorMode();
  const {
    visible,
    close,
    title = 'Title',
    subTitle = 'Subtitle',
    modalBackground = [`${colorMode}.secondaryBackground`, `${colorMode}.secondaryBackground`],
    buttonBackground = [`${colorMode}.gradientStart`, `${colorMode}.gradientEnd`],
    buttonText = 'Button text',
    buttonTextColor = `${colorMode}.white`,
    buttonCallback = props.close || null,
    textColor = `${colorMode}.GreyText`,
    cancelButtonText = 'Cancel',
    cancelButtonColor = '#073E39',
    cancelButtonPressed,
    buttonPressed,
    Content = () => <></>,
  } = props;
  const { bottom } = useSafeAreaInsets();

  const bottomMargin = Platform.select<string | number>({ ios: bottom, android: '5%' });

  return (
    <Modal
      isOpen={visible}
      onClose={close}
      avoidKeyboard
      size="xl"
      _backdrop={{ bg: '#000', opacity: 0.8 }}
      justifyContent="flex-end"

      // zIndex={'-1'}
      // style={styles.viewContainer}
      // overlayVisible
    >
      <View flex={1} style={styles.viewContainer}>
        <Modal.Content borderRadius={10} marginBottom={bottomMargin}>
          <Box style={styles.container} backgroundColor={`${colorMode}.modalWhiteBackground`}>
            <TouchableOpacity style={styles.close} onPress={close}>
              <Close />
            </TouchableOpacity>
            <Modal.Header
              alignSelf="flex-start"
              borderBottomWidth={0}
              backgroundColor="transparent"
              width="90%"
            >
              <Text style={styles.title} color={textColor} paddingBottom={1}>
                {title}
              </Text>
              <Text style={styles.subTitle} color={textColor}>
                {subTitle}
              </Text>
            </Modal.Header>
            <Modal.Body>
              <Content />
            </Modal.Body>
            <Box
              alignItems="center"
              alignSelf="flex-end"
              backgroundColor="transparent"
              flexDirection="row"
            >
              <TouchableOpacity onPress={cancelButtonPressed} testID={`btn_${cancelButtonText}`}>
                <Text fontSize={13} bold letterSpacing={1} color={cancelButtonColor} mr={wp(18)}>
                  {cancelButtonText}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={buttonPressed} testID={`btn_${buttonText}`}>
                <Box style={styles.cta} backgroundColor={`${colorMode}.greenButtonBackground`}>
                  <Text fontSize={13} bold letterSpacing={1} color={buttonTextColor}>
                    {buttonText}
                  </Text>
                </Box>
              </TouchableOpacity>
            </Box>
          </Box>
        </Modal.Content>
      </View>
    </Modal>
  );
}

export default SuccessModal;

const styles = StyleSheet.create({
  viewContainer: {
    zIndex: -1,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    flexDirection: 'column-reverse',
  },
  container: {
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    padding: '4%',
    paddingVertical: '5%',
  },
  title: {
    fontSize: 19,
    letterSpacing: 1,
  },
  subTitle: {
    fontSize: 12,
    letterSpacing: 1,
  },
  cta: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  close: {
    alignSelf: 'flex-end',
  },
});
