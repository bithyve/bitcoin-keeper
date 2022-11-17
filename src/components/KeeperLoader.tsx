import React from 'react';
import { Box, Modal, Text } from 'native-base';
import { Image, Platform, StyleSheet } from 'react-native';

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
    subTitleColor = 'light.lightBlack2',
    loadingContent,
    Content = () => {
      return (<Box>
        <Image
          source={require('src/assets/video/Loader.gif')}
          style={{
            width: wp(250),
            height: wp(100),
            alignSelf: 'center',
            marginTop: hp(30)
          }} />
        <Text
          color={'light.modalText'}
          fontWeight={200}
          fontSize={13}
          letterSpacing={0.65}
          marginTop={hp(60)}
          width={wp(240)}
        >
          {loadingContent?.message}
        </Text>
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

      <Modal.Content
        borderRadius={10}
        marginBottom={bottomMargin}
      >
        <GestureHandlerRootView>
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            colors={modalBackground}
            style={styles.container}
          >
            <Modal.Header style={styles.headerContainer}>
              <Text
                style={styles.title}
                color={textColor}
              >
                {loadingContent?.title}
              </Text>
              <Text
                style={styles.subTitle}
                color={subTitleColor}
              >
                {loadingContent.subtitle}
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
    // alignItems: 'center',
    padding: '4%',
  },
  title: {
    fontSize: 19,
    letterSpacing: 1,
  },
  subTitle: {
    fontSize: 13,
    letterSpacing: 1.3,
    marginTop: hp(5)
  },
  close: {
    alignSelf: 'flex-end',
  },
  headerContainer: {
    alignSelf: 'flex-start',
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
    width: wp(240)
  },
});
