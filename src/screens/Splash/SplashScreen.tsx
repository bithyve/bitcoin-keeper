import { ImageBackground, StatusBar } from 'react-native';
import React, { useEffect } from 'react';
import SplashBackground from 'src/assets/images/SplashBackground.png';
import RestClient from 'src/core/services/rest/RestClient';
import { useAppSelector } from 'src/store/hooks';
import Video from 'react-native-video';
import Instabug, { BugReporting } from 'instabug-reactnative';
import config from 'src/core/config';
import * as SecureStore from '../../storage/secure-store';

function SplashScreen({ navigation }) {
  const { torEnbled } = useAppSelector((state) => state.settings);

  useEffect(() => {
    RestClient.setUseTor(torEnbled);
  }, []);

  const navigateToApp = async () => {
    const hasCreds = await SecureStore.hasPin();
    if (!__DEV__) {
      Instabug.start(config.INSTABUG_TOKEN, [Instabug.invocationEvent.shake]);
      BugReporting.setOptions([BugReporting.option.emailFieldHidden]);
      BugReporting.setInvocationEvents([Instabug.invocationEvent.shake]);
      BugReporting.setReportTypes([BugReporting.reportType.bug, BugReporting.reportType.feedback]);
      BugReporting.setShakingThresholdForiPhone(1.0);
      Instabug.setPrimaryColor('rgb(7, 62, 57)');
    }
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
