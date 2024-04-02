import React from 'react';
import { Box, Modal, useColorMode } from 'native-base';
import { Platform, StyleSheet } from 'react-native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import LoadingAnimation from './Loader';

function KeeperLoader(props) {
  const { colorMode } = useColorMode();
  const {
    visible,
    close,
    modalBackground = [`${colorMode}.primaryBackground`, `${colorMode}.primaryBackground`],
    textColor = `${colorMode}.black`,
    subTitleColor = `${colorMode}.secondaryText`,
    loadingContent,
    Content = () => (
      <Box style={{ width: windowWidth * 0.8 }}>
        <LoadingAnimation />
        <Text
          color={`${colorMode}.greenText`}
          fontSize={13}
          letterSpacing={0.65}
          marginTop={hp(60)}
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
          <Box style={styles.container} backgroundColor={`${colorMode}.primaryBackground`}>
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
          </Box>
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
