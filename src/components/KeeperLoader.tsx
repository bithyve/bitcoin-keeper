import React from 'react';
import { Box, Modal, Text } from 'native-base';
import { ActivityIndicator, Platform, StyleSheet } from 'react-native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

const KeeperLoader = (props) => {
  const {
    visible,
    close,
    modalBackground = ['#F7F2EC', '#F7F2EC'],
    textColor = '#000',
    subTitleColor = textColor,
    Content = () => {
      return (<Box alignSelf={'center'} height={hp(70)}>
        <ActivityIndicator />
      </Box>)
    },
    dismissible = true,

  } = props;
  const { bottom } = useSafeAreaInsets();
  const bottomMargin = Platform.select<string | number>({ ios: bottom, android: '5%' });

  return (
    <Modal
      isOpen={visible}
      onClose={dismissible ? close : null}
      avoidKeyboard
      size="lg"
      _backdrop={{ bg: '#000', opacity: 0.3 }}
      justifyContent={'flex-end'}
      closeOnOverlayClick={false}
    >

      <Modal.Content borderRadius={10} marginBottom={bottomMargin}>
        <GestureHandlerRootView>
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            colors={modalBackground}
            style={styles.container}
          >
            <Modal.Header
              alignSelf={'flex-start'}
              borderBottomWidth={0}
              backgroundColor={'transparent'}
              width={'90%'}
            >
              <Text style={styles.title} fontFamily={'body'} fontWeight={'200'} color={textColor}>
                Loading
              </Text>
              <Text
                style={styles.subTitle}
                fontFamily={'body'}
                fontWeight={'200'}
                color={subTitleColor}
              >
                Please wait
              </Text>
            </Modal.Header>
            <Modal.Body>
              <Content />
            </Modal.Body>
          </LinearGradient>
        </GestureHandlerRootView>
      </Modal.Content>
    </Modal>
  );
};

export default KeeperLoader;

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
    alignItems: 'center',
  },
  close: {
    alignSelf: 'flex-end',
  },
});
