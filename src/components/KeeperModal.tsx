import { Box, Link, Modal, Text } from 'native-base';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';

import Close from 'src/assets/icons/modal_close.svg';
import CloseGreen from 'src/assets/icons/modal_close_green.svg';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
    learnMore = false,
    learnMoreCallback = () => { }
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
        <GestureHandlerRootView>
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
              <Text style={styles.title} fontFamily={'body'} fontWeight={'200'} color={textColor}>
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
            {(learnMore || buttonText) &&
              <Box
                flexDirection={'row'}
                justifyContent={'space-between'}
                alignItems={'center'}
                width={'100%'}
              >
                {learnMore ?
                  <Box
                    borderColor={'light.yellow2'}
                    borderRadius={hp(40)}
                    borderWidth={1}
                    alignItems={'center'}
                    justifyContent={'center'}
                    backgroundColor={'#00433A'}
                    style={{
                      height: hp(34),
                      width: wp(110),
                      marginLeft: wp(10)
                    }}
                  >
                    <Link onPress={learnMoreCallback}>
                      <Text color={'light.yellow2'} fontSize={13} fontFamily={'body'} fontWeight={'200'} >
                        {'Learn More'}
                      </Text>
                    </Link>
                  </Box>
                  :
                  <Box></Box>
                }
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
              </Box>}
          </LinearGradient>
        </GestureHandlerRootView>
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
    borderRadius: 10,
    width: wp(110),
    height: hp(45),
    justifyContent: 'center',
    alignItems: 'center'
  },
  close: {
    alignSelf: 'flex-end',
  },
});
