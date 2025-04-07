import React, { useContext } from 'react';
import { Linking, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Box, useColorMode } from 'native-base';

import { wp, hp, windowWidth } from 'src/constants/responsive';
import Text from './KeeperText';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function CameraUnauthorized() {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { settings } = translations;
  const requestPermission = () => {
    Linking.openSettings();
  };

  return (
    <Box style={styles.container}>
      <Text
        color={`${colorMode}.white`}
        style={{
          fontSize: 13,
        }}
      >
        {settings.cameraAccessoff}
      </Text>
      <Text
        color={`${colorMode}.white`}
        style={{
          fontSize: 11,
        }}
      >
        {settings.turnCameraOn}
      </Text>
      <TouchableOpacity
        onPress={requestPermission}
        style={{
          marginTop: hp(15),
        }}
        testID="btn_cameraSettings"
      >
        <Box
          borderColor={`${colorMode}.learnMoreBorder`}
          backgroundColor={`${colorMode}.accent`}
          style={styles.learnMoreContainer}
        >
          <Text color={`${colorMode}.learnMoreBorder`} style={styles.learnMoreText}>
            {settings.tapToGoSetting}
          </Text>
        </Box>
      </TouchableOpacity>
    </Box>
  );
}

export default CameraUnauthorized;

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    height: windowWidth * 0.7,
    width: windowWidth * 0.8,
  },
  learnMoreContainer: {
    borderWidth: 0.5,
    borderRadius: 5,
    paddingVertical: hp(3),
    paddingHorizontal: wp(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(30),
  },
  learnMoreText: {
    fontSize: 12,
    letterSpacing: 0.6,
    alignSelf: 'center',
  },
});
