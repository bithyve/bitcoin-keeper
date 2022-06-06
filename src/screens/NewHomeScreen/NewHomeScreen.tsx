import { Animated, Dimensions, Easing, View } from 'react-native';
import { Box, Pressable, Text } from 'native-base';
import React, { useEffect, useState } from 'react';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

import Basic from 'src/assets/images/svgs/basic.svg';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import ScannerIcon from 'src/assets/images/svgs/scanner.svg';
import SettingIcon from 'src/assets/images/svgs/settings.svg';
import Vaults from './Vaults';
// components
import Wallets from './Wallets';
import { addToUaiStack } from 'src/store/actions/uai';
// icons and images
import { uaiType } from 'src/common/data/models/interfaces/Uai';
import { useDispatch } from 'react-redux';
import { useUaiStack } from 'src/hooks/useUaiStack';
import UaiDisplay from './UaiDisplay';
import { RealmSchema } from 'src/storage/realm/enum';
import { setupKeeperApp } from 'src/store/actions/storage';
import { RealmContext } from 'src/storage/realm/RealmProvider';

const width = Dimensions.get('window').width;
const NewHomeScreen = ({ navigation }) => {
  const [vaultPosition, setVaultPosition] = useState(new Animated.Value(0));
  const [walletPosition, setWalletPosition] = useState(new Animated.Value(0));
  const dispatch = useDispatch();
  const { useQuery } = RealmContext;
  const [app] = useQuery(RealmSchema.KeeperApp);

  const { uaiStack } = useUaiStack();

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
  useEffect(() => {
    if (!app) {
      setTimeout(() => {
        dispatch(setupKeeperApp());
      }, 1000);
    }
  }, [app]);

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
        <Pressable onPress={addtoDb}>
          <ScannerIcon />
        </Pressable>
        <Box alignItems={'center'} flexDirection={'column'}>
          <Pressable marginY={2}>
            <Basic />
          </Pressable>
          {uaiStack.length > 0 ? <UaiDisplay uaiStack={uaiStack} /> : null}
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
    paddingTop: '10%',
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
