import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Permissions from 'react-native-permissions';
import { Box } from 'native-base';

import Text from './KeeperText';
import { wp, hp } from 'src/common/data/responsiveness/responsive';

function CameraUnauthorized() {

  const requestPermission = () => {
    Permissions.openSettings();
  };

  return (
    <View
      style={{ ...styles.cameraView, backgroundColor: '#000' }}
    >
      <Box style={styles.container}>
        <Text
          color='light.white'
          style={{
            fontSize: 13
          }} >
          Camera access is turned off
        </Text>
        <Text
          color='light.white'
          style={{
            fontSize: 11
          }}
        >
          Turn on the camera in your device settings
        </Text>
        <TouchableOpacity onPress={requestPermission}
          style={{
            marginTop: hp(15)
          }}>
          <Box
            borderColor="light.learnMoreBorder"
            backgroundColor="light.lightAccent"
            style={styles.learnMoreContainer}
          >
            <Text color="light.learnMoreBorder" style={styles.learnMoreText}>
              Tap to go to settings
            </Text>
          </Box>
        </TouchableOpacity>
      </Box>
    </View>
  );
}

export default CameraUnauthorized;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    flex: 1,
    marginBottom: hp(40)
  },
  learnMoreContainer: {
    borderWidth: 0.5,
    borderRadius: 5,
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  learnMoreText: {
    fontSize: 12,
    letterSpacing: 0.6,
    alignSelf: 'center',
  },
  cameraView: {
    height: hp(280),
    width: wp(375),
  }
});
