import { Modal, Text, View, Box } from 'native-base';
import { StyleSheet, TouchableOpacity, Platform } from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import React from 'react';
import { wp } from 'src/common/data/responsiveness/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Close from 'src/assets/icons/modal_close.svg';

const SuccessModal = (props) => {
  const {
    visible,
    close,
    title = 'Title',
    subTitle = 'Subtitle',
    modalBackground = ['#F7F2EC', '#F7F2EC'],
    buttonBackground = ['#00836A', '#073E39'],
    buttonText = 'Button text',
    buttonTextColor = '#FAFAFA',
    buttonCallback = props.close || null,
    textColor = '#4F5955',
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
      justifyContent={'flex-end'}

      // zIndex={'-1'}
      // style={styles.viewContainer}
      // overlayVisible
    >
      <View flex={1} style={styles.viewContainer}>
        <Modal.Content borderRadius={10} marginBottom={bottomMargin}>
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            colors={modalBackground}
            style={styles.container}
          >
            <TouchableOpacity style={styles.close} onPress={close}>
              <Close />
            </TouchableOpacity>
            <Modal.Header
              alignSelf={'flex-start'}
              borderBottomWidth={0}
              backgroundColor={'transparent'}
              width={'90%'}
            >
              <Text
                style={styles.title}
                fontFamily={'body'}
                fontWeight={'200'}
                color={textColor}
                paddingBottom={1}
              >
                {title}
              </Text>
              <Text
                style={styles.subTitle}
                fontFamily={'body'}
                fontWeight={'100'}
                color={textColor}
              >
                {subTitle}
              </Text>
            </Modal.Header>
            <Modal.Body>
              <Content />
            </Modal.Body>
            <Box
              alignItems={'center'}
              alignSelf={'flex-end'}
              bg={'transparent'}
              flexDirection={'row'}
            >
              <TouchableOpacity onPress={cancelButtonPressed}>
                <Text
                  fontSize={13}
                  fontFamily={'body'}
                  fontWeight={'300'}
                  letterSpacing={1}
                  color={cancelButtonColor}
                  mr={wp(18)}
                >
                  {cancelButtonText}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={buttonPressed}>
                <LinearGradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  colors={buttonBackground}
                  style={styles.cta}
                >
                  <Text
                    fontSize={13}
                    fontFamily={'body'}
                    fontWeight={'300'}
                    letterSpacing={1}
                    color={buttonTextColor}
                  >
                    {buttonText}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Box>
          </LinearGradient>
        </Modal.Content>
      </View>
    </Modal>
  );
};

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
