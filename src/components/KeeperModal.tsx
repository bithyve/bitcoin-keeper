import { Box, Modal, Text } from 'native-base';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';

import Close from 'src/assets/icons/modal_close.svg';
import CloseGreen from 'src/assets/icons/modal_close_green.svg';
import LinearGradient from 'react-native-linear-gradient';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

const KeeperModal = (props) => {
  const {
    visible,
    close,
    title = 'Title',
    subTitle = null,
    modalBackground = ['#F7F2EC', '#F7F2EC'],
    buttonBackground = ['#00836A', '#073E39'],
    buttonText = null,
    buttonTextColor = 'white',
    buttonCallback = props.close || null,
    textColor = '#000',
    DarkCloseIcon = false,
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
    >
      <Modal.Content borderRadius={10} marginBottom={bottomMargin}>
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          colors={modalBackground}
          style={styles.container}
        >
          <TouchableOpacity style={styles.close} onPress={close}>
            {DarkCloseIcon ? <CloseGreen /> : <Close />}
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
            <Text style={styles.subTitle} fontFamily={'body'} fontWeight={'100'} color={textColor}>
              {subTitle}
            </Text>
          </Modal.Header>
          <Modal.Body>
            <Content />
          </Modal.Body>
          {buttonText && (
            <Box alignSelf={'flex-end'} bg={'transparent'}>
              <TouchableOpacity onPress={buttonCallback}>
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
          )}
        </LinearGradient>
      </Modal.Content>
    </Modal>
  );
};

export default KeeperModal;

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    alignItems: 'center',
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
    paddingHorizontal: wp(20),
    borderRadius: 10,
  },
  close: {
    alignSelf: 'flex-end',
  },
});
