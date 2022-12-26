import React from 'react';
import { Box, Modal } from 'native-base';
import { Image, Platform, StyleSheet } from 'react-native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LinearGradient from 'src/components/KeeperGradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import Text from 'src/components/KeeperText';

function KeeperLoader(props) {
  const {
    visible,
    close,
    modalBackground = ['light.secondaryBackground', 'light.secondaryBackground'],
    textColor = '#000',
    subTitleColor = 'light.secondaryText',
    loadingContent,
    Content = () => (
      <Box>
        <Image
          source={require('src/assets/video/Loader.gif')}
          style={{
            width: wp(250),
            height: wp(100),
            alignSelf: 'center',
            marginTop: hp(30),
          }}
        />
        <Text
          color="light.greenText"
          fontSize={13}
          letterSpacing={0.65}
          marginTop={hp(60)}
          width={wp(240)}
        >
          {loadingContent?.message}
        </Text>
      </Box>
    ),
    dismissible = true,
  } = props;
  const { bottom } = useSafeAreaInsets();
  const bottomMargin = Platform.select<string | number>({ ios: bottom, android: '5%' });

  return (
    <Modal
      isOpen={visible}
      onClose={dismissible ? close : null}
      avoidKeyboard
      size="xl"
      _backdrop={{ bg: '#000', opacity: 0.3 }}
      justifyContent="flex-end"
      closeOnOverlayClick={false}
    >
      <Modal.Content borderRadius={10} marginBottom={bottomMargin}>
        <GestureHandlerRootView>
          <LinearGradient
            start={[0, 0]}
            end={[1, 1]}
            colors={modalBackground}
            style={styles.container}
          >
            <Modal.Header style={styles.headerContainer}>
              <Text style={styles.title} color={textColor}>
                {loadingContent?.title}
              </Text>
              <Text style={styles.subTitle} color={subTitleColor}>
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
}

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
    marginTop: hp(5),
  },
  close: {
    alignSelf: 'flex-end',
  },
  headerContainer: {
    alignSelf: 'flex-start',
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
    width: wp(240),
  },
});
