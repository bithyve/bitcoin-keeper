import { Animated, Modal, Platform, StyleSheet } from 'react-native';
import { Pressable, useColorMode, View } from 'native-base';

import NFCSVG from 'src/assets/images/nfc.svg';
import React from 'react';
import Text from 'src/components/KeeperText';
import { windowWidth } from 'src/constants/responsive';
import NFC from 'src/services/nfc';

function NfcPrompt({
  visible = true,
  close,
  ctaText,
}: {
  visible: boolean;
  close;
  ctaText?: string;
}) {
  const { colorMode } = useColorMode();
  const animation = React.useRef(new Animated.Value(0)).current;

  if (Platform.OS === 'ios') {
    return null;
  }

  if (visible) {
    Animated.timing(animation, {
      duration: 500,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  } else {
    Animated.timing(animation, {
      duration: 400,
      toValue: 0,
      useNativeDriver: true,
    }).start();
  }

  const onCancel = async () => {
    Animated.timing(animation, {
      duration: 400,
      toValue: 0,
      useNativeDriver: true,
    }).start(async () => {
      close();
      await NFC.cancelRequest();
    });
  };

  const bgAnimStyle = {
    backgroundColor: 'rgba(0,0,0,0.3)',
    opacity: animation,
  };
  const promptAnimStyle = {
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [300, 0],
        }),
      },
    ],
  };

  return (
    <Modal transparent visible={visible}>
      <View style={[styles.wrapper]}>
        <View style={{ flex: 1 }} />
        <Animated.View style={[styles.prompt, promptAnimStyle]}>
          <View style={styles.center} backgroundColor={`${colorMode}.textInputBackground`}>
            <NFCSVG />
            <Text color={`${colorMode}.greenText`} style={{ textAlign: 'center' }}>
              Please hold until the scanning is complete...
            </Text>
            <Pressable style={styles.cancel} onPress={onCancel}>
              <Text color={`${colorMode}.greenText`} style={{ textAlign: 'center' }}>
                {ctaText || 'Cancel'}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
        <Animated.View style={[styles.promptBg, bgAnimStyle]} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  promptBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  prompt: {
    height: 300,
    zIndex: 2,
    alignSelf: 'stretch',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    padding: 20,
    margin: 20,
  },
  cancel: {
    width: windowWidth * 0.7,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,.2)',
    borderRadius: 10,
    marginTop: 5,
  },
});

export default NfcPrompt;
