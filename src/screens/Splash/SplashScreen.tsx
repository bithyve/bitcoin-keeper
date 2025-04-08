import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useColorMode } from 'native-base';
import RestClient from 'src/services/rest/RestClient';
import { useAppSelector } from 'src/store/hooks';
import * as SecureStore from 'src/storage/secure-store';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import KeeperLogo from 'src/assets/images/logo.svg';
import TeamBithyve from 'src/assets/images/fromBithyve.svg';
import Tagline from 'src/assets/images/tagline.svg';
import { windowHeight, windowWidth } from 'src/constants/responsive';
import { useDispatch } from 'react-redux';
import config from 'src/utils/service-utilities/config';
import { NetworkType } from 'src/services/wallets/enums';
import { changeBitcoinNetwork } from 'src/store/sagaActions/settings';
import { setDefaultWalletCreated } from 'src/store/reducers/storage';

function SplashScreen({ navigation }) {
  const { torEnbled, themeMode, bitcoinNetworkType } = useAppSelector((state) => state.settings);
  const dispatch = useDispatch();
  const { toggleColorMode, colorMode } = useColorMode();

  const animate = () => {
    progress.value = withTiming(4, { duration: 3000 }, (finished) => {
      if (finished) {
        runOnJS(navigateToApp)();
      }
    });
  };

  useEffect(() => {
    if (!bitcoinNetworkType)
      dispatch(
        setDefaultWalletCreated({
          networkType: config.isDevMode() ? NetworkType.TESTNET : NetworkType.MAINNET,
          created: true,
        })
      );
    dispatch(changeBitcoinNetwork(config.isDevMode() ? NetworkType.TESTNET : NetworkType.MAINNET));
  }, []);

  useEffect(() => {
    animate();
    if (colorMode !== themeMode.toLocaleLowerCase()) {
      toggleColorMode();
    }
    RestClient.setUseTor(torEnbled);
  }, []);

  const navigateToApp = async () => {
    try {
      const hasCreds = await SecureStore.hasPin();
      if (hasCreds) {
        navigation.replace('Login', { relogin: false });
      } else {
        navigation.replace('CreatePin');
      }
    } catch (err) {
      console.log(err);
    }
  };

  const progress = useSharedValue(0);
  const inputRange = [0, 1, 2, 3, 4];
  const heightRange = [0, windowHeight * 2, windowHeight * 2, windowHeight, windowHeight];
  const widthRange = [0, windowHeight * 2, windowHeight * 2, windowHeight, windowWidth];
  const radiusRange = [0, windowHeight, windowHeight * 2, 0, 0];
  const scaleRange = [4, 3, 1, 1, 1];
  const logoOpacityRange = [0, 0, 1, 1, 1];
  const tagOpacityRange = [0, 0, 0, 1, 1];
  const teamOpacityRange = [0, 0, 0, 0, 1];

  const SCALE_CONFIG = {
    overshootClamping: false,
    restSpeedThreshold: 1,
    stiffness: 100,
    restDisplacementThreshold: 0.1,
  };

  const animatedBackground = useAnimatedStyle(() => {
    const height = interpolate(progress.value, inputRange, heightRange);
    const width = interpolate(progress.value, inputRange, widthRange);
    const borderRadius = interpolate(progress.value, inputRange, radiusRange);
    return {
      position: 'absolute',
      height,
      width,
      borderRadius,
      backgroundColor: '#2D6759',
    };
  });

  const animatedLogo = useAnimatedStyle(() => {
    const scale = withSpring(interpolate(progress.value, inputRange, scaleRange), SCALE_CONFIG);
    const opacity = withSpring(
      interpolate(progress.value, inputRange, logoOpacityRange),
      SCALE_CONFIG
    );
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const animatedTagline = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, inputRange, tagOpacityRange, {
      extrapolateRight: Extrapolation.CLAMP,
    });
    return {
      marginVertical: 10,
      opacity,
    };
  });

  const animatedTeam = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, inputRange, teamOpacityRange);
    return {
      top: windowHeight * 0.32,
      opacity,
    };
  });

  return (
    <Animated.View style={styles.center}>
      <Animated.View style={animatedBackground} />
      <Animated.View style={animatedLogo}>
        <KeeperLogo />
      </Animated.View>
      <Animated.View style={animatedTagline}>
        <Tagline />
      </Animated.View>
      <Animated.View style={animatedTeam}>
        <TeamBithyve />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SplashScreen;
