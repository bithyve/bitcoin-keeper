import React, { useEffect } from 'react';
import { StatusBar, ImageBackground } from 'react-native';
import Video from 'react-native-video';
import * as SecureStore from '../../storage/secure-store';

import SplashBackground from 'src/assets/images/SplashBackground.png';
import RestClient from 'src/core/services/rest/RestClient';
import { useAppSelector } from 'src/store/hooks';

const SplashScreen = ({ navigation }) => {

  const { torEnbled } = useAppSelector(state => state.settings)

  useEffect(() => {
    RestClient.setUseTor(torEnbled)
    setTimeout(async () => {
      const hasCreds = await SecureStore.hasPin();
      if (hasCreds) {
        RestClient.setUseTor(true)
        navigation.replace('Login', { relogin: false });
      } else {
        navigation.replace('CreatePin');
      }
    }, 8000);
  }, []);

  return (
    <ImageBackground resizeMode="contain" style={{ flex: 1 }} source={SplashBackground}>
      <StatusBar barStyle={'light-content'} />
      <Video
        source={require('src/assets/video/Splash_animation.mp4')}
        style={{
          flex: 1,
        }}
        muted={true}
        repeat={false}
        resizeMode={'cover'}
        rate={1.0}
        ignoreSilentSwitch={'obey'}
      />
    </ImageBackground>
  );
};

export default SplashScreen;
