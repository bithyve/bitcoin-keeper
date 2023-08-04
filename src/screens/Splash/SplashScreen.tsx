import { Image, StatusBar, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { Box, useColorMode } from 'native-base';

import BithyveTeam from 'src/assets/images/BithyveTeam.svg'
import RestClient from 'src/core/services/rest/RestClient';
import { useAppSelector } from 'src/store/hooks';
import ScreenWrapper from 'src/components/ScreenWrapper';
import * as SecureStore from '../../storage/secure-store';

function SplashScreen({ navigation }) {
  const { torEnbled, themeMode } = useAppSelector((state) => state.settings);
  const { toggleColorMode, colorMode } = useColorMode()

  useEffect(() => {
    if (colorMode !== themeMode.toLocaleLowerCase()) {
      toggleColorMode()
    }

    RestClient.setUseTor(torEnbled);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      navigateToApp()
    }, 2000)
  }, []);

  const navigateToApp = async () => {
    const hasCreds = await SecureStore.hasPin();
    if (hasCreds) {
      navigation.replace('Login', { relogin: false });
    } else {
      navigation.replace('CreatePin');
    }
  };

  return (
    // <ImageBackground resizeMode="contain" style={{ flex: 1 }} source={SplashBackground}>
    //   <StatusBar barStyle="light-content" />
    //   <Video
    //     source={require('src/assets/video/Splash_animation.mp4')}
    //     style={{
    //       flex: 1,
    //     }}
    //     muted
    //     repeat={false}
    //     resizeMode="cover"
    //     ignoreSilentSwitch="obey"
    //     onEnd={navigateToApp}
    //   />
    // </ImageBackground>
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryGreenBackground`}>
      <StatusBar barStyle="light-content" />
      <Box style={styles.keeperImageWrapper} >
        <Image
          style={styles.keeperImageStyle}
          source={require('src/assets/images/SplashKeeperImage.png')}
        />
      </Box>
      <Box style={styles.bottomViewWrapper}>
        <BithyveTeam />
      </Box>

    </ScreenWrapper>
  );
}
const styles = StyleSheet.create({
  keeperImageWrapper: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  keeperImageStyle: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain'
  },
  bottomViewWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end'
  }
})
export default SplashScreen;
