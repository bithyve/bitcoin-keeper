import React, { useEffect, useRef } from 'react';
import { ImageBackground, Image, AppState } from 'react-native';
import { Box, Pressable, Text } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import { useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
// icons and images
import ScannerIcon from 'src/assets/images/svgs/scan.svg';
import SettingIcon from 'src/assets/images/svgs/settings.svg';
import Arrow from 'src/assets/images/svgs/arrow.svg';
import Basic from 'src/assets/images/svgs/basic.svg';
import Inheritance from 'src/assets/images/svgs/inheritance.svg';
import VaultImage from 'src/assets/images/Vault.png';
import BTC from 'src/assets/images/svgs/btc.svg';
// components, functions and hooks
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import { uaiType } from 'src/common/data/models/interfaces/Uai';
// import { useUaiStack } from 'src/hooks/useUaiStack';
// import UaiDisplay from './UaiDisplay';
import { addToUaiStack } from 'src/store/sagaActions/uai';

const HomeScreen = ({ navigation }: { navigation }) => {

  const dispatch = useDispatch();
  const appState = useRef(AppState.currentState);
  // const { uaiStack } = useUaiStack();

  useEffect(() => {
    const subscription = AppState.addEventListener("change", nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        navigation.navigate('Login', { relogin: true })
      }
      appState.current = nextAppState;
    });
    return () => {
      subscription.remove();
    };
  }, []);

  const addtoDb = () => {
    dispatch(
      addToUaiStack(
        'A new version of the app is available',
        true,
        uaiType.RELEASE_MESSAGE,
        90,
        'Lorem ipsum dolor sit amet, consectetur eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
      )
    );
    dispatch(
      addToUaiStack(
        'Your Keeper request was rejected',
        true,
        uaiType.ALERT,
        80,
        'Lorem ipsum dolor sit amet, consectetur eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
      )
    );
    dispatch(
      addToUaiStack(
        'Wallet restore was attempted on another device',
        true,
        uaiType.ALERT,
        80,
        'Lorem ipsum dolor sit amet, consectetur eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
      )
    );
  };

  const NextIcon = () => {
    return (
      <Box
        backgroundColor={'light.yellow1'}
        height={hp(37.352)}
        width={hp(37.352)}
        borderRadius={20}
        justifyContent={'center'}
        alignItems={'center'}
      >
        <Arrow />
      </Box>
    )
  }

  return (
    <Box
      flex={1}
      backgroundColor={'light.lightYellow'}
    >
      <LinearGradient
        colors={['#00836A', '#073E39']}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={styles.linearGradient}
      >
        <Box
          paddingX={10}
          alignItems={'center'}
        >
          <Box
            flexDirection={'row'}
            alignItems={'center'}
            justifyContent={'space-between'}
            width={'100%'}
          >
            <Pressable onPress={addtoDb}>
              <ScannerIcon />
            </Pressable>
            <Pressable >
              <Basic />
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('AppSettings')}
            >
              <SettingIcon />
            </Pressable>
          </Box>
          <Box
            backgroundColor={'light.AddSignerCard'}
            height={hp(60)}
            width={wp(259)}
            borderRadius={hp(20)}
            marginTop={hp(44)}
            flexDirection={'row'}
            justifyContent={'space-between'}
            alignItems={'center'}
            paddingX={4}
          >
            <Text
              noOfLines={2}
              width={wp(170)}
              color={'light.white1'}
              letterSpacing={0.6}
              fontSize={RFValue(12)}
              fontWeight={200}
              lineHeight={14}
            >
              Add Signers to Secure your Vault
            </Text>
            <NextIcon />
          </Box>
        </Box>
      </LinearGradient>

      <Box
        marginTop={-(hp(97.44))}
        alignItems={'center'}
      >
        <ImageBackground
          resizeMode="contain"
          style={styles.vault}
          source={VaultImage}
        >
          <Box
            backgroundColor={'light.TorLable'}
            height={hp(13.804)}
            width={wp(60)}
            borderRadius={hp(14)}
            justifyContent={'center'}
            alignItems={'center'}
            marginTop={hp(30)}
          >
            <Text
              color={'light.lightBlack'}
              letterSpacing={0.9}
              fontSize={RFValue(9)}
              fontWeight={300}
            >
              Tor Enabled
            </Text>
          </Box>

          <Box
            marginTop={hp(64.5)}
            alignItems={'center'}
          >
            <Text
              color={'light.white1'}
              letterSpacing={0.8}
              fontSize={RFValue(16)}
              fontWeight={300}
            >
              Your Vault
            </Text>
            <Text
              color={'light.white1'}
              letterSpacing={0.9}
              fontSize={RFValue(12)}
              fontWeight={100}
              opacity={0.8}
            >
              Pending Activation
            </Text>
          </Box>

          <Box marginTop={hp(31.5)}>
            <Image
              source={require('src/assets/images/illustration.png')}
              style={{ width: wp(123.95), height: hp(122.3) }}
              resizeMode="contain"
            />
          </Box>
        </ImageBackground>
      </Box>

      <Box
        alignItems={'center'}
        marginTop={hp(19.96)}
      >
        <LinearGradient
          colors={['#00836A', '#073E39']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bottomCard}
        >
          <Box
            marginLeft={wp(9.75)}
            flexDirection={'row'}
            alignItems={'center'}
          >
            <Inheritance />
            <Box marginLeft={wp(18)}>
              <Text
                color={'light.white1'}
                letterSpacing={0.8}
                fontSize={RFValue(16)}
                fontWeight={200}
              >
                Inheritance
              </Text>
              <Text
                color={'light.white1'}
                letterSpacing={0.6}
                fontSize={RFValue(12)}
                fontWeight={100}
                marginTop={-1}
              >
                Upgrade to secure your Vault
              </Text>
            </Box>
          </Box>
          <NextIcon />
        </LinearGradient>
      </Box>

      <Pressable
        alignItems={'center'}
        marginTop={hp(8)}
        onPress={() => navigation.navigate('HardwareSetup')}
      >
        <LinearGradient
          colors={['#00836A', '#073E39']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bottomCard}
        >
          <Box
            marginLeft={wp(9.75)}
            flexDirection={'row'}
            alignItems={'center'}
          >
            <Inheritance />
            <Box
              marginLeft={wp(18)}
              flexDirection={'row'}
              alignItems={'center'}
            >
              <Text
                color={'light.white1'}
                letterSpacing={1.76}
                fontSize={RFValue(22)}
                fontWeight={200}
              >
                01
              </Text>
              <Text
                color={'light.white1'}
                letterSpacing={0.7}
                fontSize={RFValue(14)}
                fontWeight={200}
                marginLeft={'1'}
              >
                Linked Wallet
              </Text>
            </Box>
          </Box>
          <Text
            color={'light.white1'}
            letterSpacing={0.6}
            fontSize={RFValue(30)}
            fontWeight={200}
          >
            <Box
              padding={1}
              marginBottom={0.5}
            >
              <BTC />
            </Box>
            0.00
          </Text>
        </LinearGradient>
      </Pressable>
    </Box>
  );
};

const styles = ScaledSheet.create({
  linearGradient: {
    justifyContent: 'space-between',
    paddingTop: hp(57),
    height: hp(325),
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15
  },
  vault: {
    width: wp(271.28),
    height: hp(346.04),
    alignItems: 'center'
  },
  bottomCard: {
    justifyContent: 'space-between',
    alignItems: 'center',
    height: hp(100),
    width: wp(335),
    borderRadius: 10,
    flexDirection: 'row',
    paddingHorizontal: wp(10)
  },
});

export default HomeScreen;
