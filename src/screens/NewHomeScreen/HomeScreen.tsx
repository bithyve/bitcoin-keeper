import React from 'react';
import { ImageBackground, Image } from 'react-native';
import { Box, Pressable, Text } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
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
import { windowHeight, windowWidth } from 'src/common/data/responsiveness/responsive';

const HomeScreen = ({ navigation }: { navigation }) => {

  const NextIcon = () => {
    return (
      <Box
        backgroundColor={'light.yellow1'}
        height={windowHeight * 0.046}
        width={windowHeight * 0.046}
        borderRadius={20}
        justifyContent={'center'}
        alignItems={'center'}
      >
        <Arrow />
      </Box>
    )
  }

  return (
    <Box flex={1} backgroundColor={'light.lightYellow'}>
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
            <Pressable>
              <ScannerIcon />
            </Pressable>
            <Pressable>
              <Basic />
            </Pressable>
            <Pressable onPress={() => navigation.navigate('AppSettings')}>
              <SettingIcon />
            </Pressable>
          </Box>
          <Box
            backgroundColor={'light.AddSignerCard'}
            height={windowHeight * 0.07}
            width={windowWidth * 0.69}
            borderRadius={windowHeight * 0.024}
            marginTop={windowHeight * 0.05}
            flexDirection={'row'}
            justifyContent={'space-between'}
            alignItems={'center'}
            paddingX={4}
          >
            <Text
              noOfLines={2}
              width={windowWidth * 0.40}
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

      <Box marginTop={-(windowHeight * 0.120)} alignItems={'center'}>
        <ImageBackground resizeMode="contain" style={styles.vault} source={VaultImage}>

          <Box
            backgroundColor={'light.TorLable'}
            height={windowHeight * 0.017}
            width={windowWidth * 0.08}
            borderRadius={windowHeight * 0.050}
            justifyContent={'center'}
            alignItems={'center'}
            marginTop={windowHeight * 0.04}
          >
            <Text
              color={'light.lightBlack'}
              letterSpacing={0.9}
              fontSize={RFValue(9)}
              fontWeight={200}
            >
              TOR
            </Text>
          </Box>

          <Box
            marginTop={windowHeight * 0.076}
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

          <Box marginTop={windowHeight * 0.038}>
            <Image
              source={require('src/assets/images/illustration.png')}
              style={{ width: windowWidth * 0.330, height: windowHeight * 0.150 }}
              resizeMode="contain"
            />
          </Box>
        </ImageBackground>
      </Box>

      <Box alignItems={'center'} marginTop={windowHeight * 0.020}>
        <LinearGradient
          colors={['#00836A', '#073E39']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bottomCard}
        >
          <Box marginLeft={windowWidth * 0.026} flexDirection={'row'} alignItems={'center'}>
            <Inheritance />
            <Box marginLeft={windowWidth * 0.048}>
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

      <Box alignItems={'center'} marginTop={windowHeight * 0.0098}>
        <LinearGradient
          colors={['#00836A', '#073E39']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bottomCard}
        >
          <Box marginLeft={windowWidth * 0.026} flexDirection={'row'} alignItems={'center'}>
            <Inheritance />
            <Box marginLeft={windowWidth * 0.048} flexDirection={'row'} alignItems={'center'}>
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
            <Box padding={1} marginBottom={0.5}>
              <BTC />
            </Box>
            0.00
          </Text>
        </LinearGradient>
      </Box>
    </Box>
  );
};

const styles = ScaledSheet.create({
  linearGradient: {
    justifyContent: 'space-between',
    paddingTop: windowHeight * 0.07,
    height: windowHeight * 0.40,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15
  },
  vault: {
    width: windowWidth * 0.833,
    height: windowHeight * 0.42,
    alignItems: 'center'
  },
  bottomCard: {
    justifyContent: 'space-between',
    alignItems: 'center',
    height: windowHeight * 0.123,
    width: windowWidth * 0.893,
    borderRadius: 10,
    flexDirection: 'row',
    paddingHorizontal: windowWidth * 0.026
  },
});

export default HomeScreen;
