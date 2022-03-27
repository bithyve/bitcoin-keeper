import { StyleSheet, Text, View } from 'react-native';
import React, { useRef } from 'react';
import { RNCamera } from 'react-native-camera';

const QRscanner = () => {
  const cameraRef = useRef<RNCamera>();

  return (
    <View style={styles.qrcontainer}>
      <RNCamera
        ref={cameraRef}
        style={styles.cameraView}
        onBarCodeRead={(event) => {
          console.log('read', event);
        }}
        captureAudio={false}
      />
    </View>
  );
};

export default QRscanner;

const styles = StyleSheet.create({
  qrcontainer: {
    flex: 1,
    margin: 20,
  },
  cameraView: {
    aspectRatio: 1,
    borderRadius: 40,
  },
});
