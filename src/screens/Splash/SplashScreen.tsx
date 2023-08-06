import { Image, ImageBackground, StatusBar, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { Box, useColorMode } from 'native-base';

import BithyveTeam from 'src/assets/images/BithyveTeam.svg'
import RestClient from 'src/core/services/rest/RestClient';
import { useAppSelector } from 'src/store/hooks';
import ScreenWrapper from 'src/components/ScreenWrapper';
import SplashBackground from 'src/assets/images/SplashBackground.png'
import { hp, wp } from 'src/common/data/responsiveness/responsive';
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
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryGreenBackground`}>
      <StatusBar barStyle="light-content" />
      <ImageBackground resizeMode="contain" source={SplashBackground} style={styles.container}>
        <Image
          style={styles.keeperImageStyle}
          source={require('src/assets/images/SplashKeeperImage.png')}
        />
      </ImageBackground>
      <Box style={styles.bottomViewWrapper}>
        <BithyveTeam />
      </Box>
    </ScreenWrapper>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: wp(20)
  },
  keeperImageStyle: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain'
  },
  bottomViewWrapper: {
    position: 'absolute',
    bottom: hp(12),
    width: '100%',
    marginLeft: wp(10),
    alignItems: 'center',
  }
})
export default SplashScreen;
