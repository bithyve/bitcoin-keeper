import { Animated, Modal, Platform, StyleSheet } from 'react-native';
import { Text, View } from 'native-base';

import NFC from 'src/assets/images/nfc.svg';
import React from 'react';

function NfcPrompt({ visible }) {
  const animation = React.useRef(new Animated.Value(0)).current;

  if (Platform.OS === 'ios') {
    return null;
  }

  visible
    ? Animated.timing(animation, {
        duration: 500,
        toValue: 1,
        useNativeDriver: true,
      }).start()
    : Animated.timing(animation, {
        duration: 400,
        toValue: 0,
        useNativeDriver: true,
      }).start();

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
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <NFC />
            <Text style={{ textAlign: 'center', color: '#073E39' }}>
              Please hold until the scanning is complete...
            </Text>
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
    alignSelf: 'stretch',
    padding: 20,
    backgroundColor: '#F7F2EC',
    borderRadius: 20,
    margin: 20,
    zIndex: 2,
  },
});

export default NfcPrompt;
