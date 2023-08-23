import { ImageBackground } from 'react-native';
import React, { useEffect } from 'react';
import Video from 'react-native-video';
import { StatusBar, useColorMode } from 'native-base';

import SplashBackground from 'src/assets/images/SplashBackground.png';
import RestClient from 'src/core/services/rest/RestClient';
import { useAppSelector } from 'src/store/hooks';
import * as SecureStore from '../../storage/secure-store';

function SplashScreen({ navigation }) {
  const { torEnbled, themeMode } = useAppSelector((state) => state.settings);
  const { toggleColorMode, colorMode } = useColorMode();

  useEffect(() => {
    if (colorMode !== themeMode.toLocaleLowerCase()) {
      toggleColorMode();
    }

    RestClient.setUseTor(torEnbled);
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
    <ImageBackground resizeMode="contain" style={{ flex: 1 }} source={SplashBackground}>
      <StatusBar barStyle="light-content" />
      <Video
        source={require('src/assets/video/Splash_animation.mp4')}
        style={{
          flex: 1,
        }}
        muted
        repeat={false}
        resizeMode="cover"
        ignoreSilentSwitch="obey"
        onEnd={navigateToApp}
      />
    </ImageBackground>
  );
}

export default SplashScreen;
