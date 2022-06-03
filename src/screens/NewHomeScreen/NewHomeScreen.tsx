import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Animated, View, Easing, Dimensions } from 'react-native';
import { Box, Text, Pressable } from 'native-base';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';

// components
import Wallets from './Wallets';
import Vaults from './Vaults';

// icons and images
import { getResponsiveHome } from 'src/common/data/responsiveness/responsive';
import ScannerIcon from 'src/assets/images/svgs/scanner.svg';
import SettingIcon from 'src/assets/images/svgs/settings.svg';
import Basic from 'src/assets/images/svgs/basic.svg';

type Props = {
  navigation: any;
};
const width = Dimensions.get('window').width;
const NewHomeScreen = ({ navigation }: Props) => {
  const [vaultPosition, setVaultPosition] = useState(new Animated.Value(0));
  const [walletPosition, setWalletPosition] = useState(new Animated.Value(0));

  const moveLeft = () => {
    Animated.timing(vaultPosition, {
      toValue: -width,
      duration: 800,
      easing: Easing.sin,
      useNativeDriver: false,
    }).start();

    Animated.timing(walletPosition, {
      toValue: -width,
      duration: 800,
      easing: Easing.sin,
      useNativeDriver: false,
    }).start();
  };

  const moveRight = () => {
    Animated.timing(vaultPosition, {
      toValue: 0,
      duration: 800,
      easing: Easing.sin,
      useNativeDriver: false,
    }).start();

    Animated.timing(walletPosition, {
      toValue: 0,
      duration: 800,
      easing: Easing.sin,
      useNativeDriver: false,
    }).start();
  };

  return (
    <Box flex={1} backgroundColor={'light.greenText'}>
      <Box style={styles.headerContainer}>
        <Pressable>
          <ScannerIcon />
        </Pressable>
        <Box alignItems={'center'} flexDirection={'column'}>
          <Pressable marginY={2}>
            <Basic />
          </Pressable>
          <Text
            color={'light.textLight'}
            fontSize={RFValue(18)}
            fontFamily={'body'}
            fontWeight={'100'}
            marginY={'2'}
          >
            Your stack is safe
          </Text>
          <TouchableOpacity style={styles.button}>
            <Text
              color={'light.textDark'}
              fontSize={RFValue(11)}
              fontFamily={'body'}
              fontWeight={'300'}
              letterSpacing={0.88}
            >
              Upgrade
            </Text>
          </TouchableOpacity>
        </Box>
        <Pressable onPress={() => navigation.navigate('AppSettings')}>
          <SettingIcon />
        </Pressable>
      </Box>
      <View style={{ flexDirection: 'row', width: '100%' }}>
        <Animated.View style={{ left: vaultPosition, width: '100%' }}>
          <Vaults animate={moveLeft} />
        </Animated.View>
        <Animated.View style={{ left: walletPosition, width: '100%' }}>
          <Wallets animate={moveRight} />
        </Animated.View>
      </View>
    </Box>
  );
};

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: hp(getResponsiveHome().padingTop),
    paddingHorizontal: wp(10),
  },
  button: {
    borderRadius: 10,
    marginTop: hp(1),
    width: 80,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAC48B',
  },
  flatlistContainer: {
    maxHeight: hp(30),
  },
  homeCard: {
    width: wp(43),
    height: hp(24),
    marginTop: hp(2),
    padding: '6@s',
    marginLeft: wp(2),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '3@s',
  },

  hexaWalletText: {
    fontSize: RFValue(8),
    letterSpacing: '0.7@s',
    lineHeight: '12@s',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hexaWalletContainer: {
    paddingHorizontal: wp(0.6),
    height: hp(1.6),
    borderRadius: '10@s',
  },

  walletContainer: {
    marginLeft: wp(1),
  },
  fundsContainer: {
    marginTop: hp(2),
    marginBottom: hp(3),
    marginLeft: wp(2),
  },
  fundstitle: {
    fontSize: RFValue(12),
    letterSpacing: '0.5@s',
    lineHeight: '16@s',
  },
  fundsSubtitle: {
    fontSize: RFValue(10),
    letterSpacing: '0.5@s',
    lineHeight: '12@s',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(1),
  },
  priceText: {
    fontSize: RFValue(24),
    letterSpacing: '0.5@s',
    lineHeight: '24@s',
    marginLeft: wp(1),
  },
});

export default NewHomeScreen;
