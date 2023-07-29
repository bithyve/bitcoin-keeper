/* eslint-disable react/no-unstable-nested-components */
import { Linking, Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import WalletIcon from 'src/assets/images/walletTab.svg';
import WalletActiveIcon from 'src/assets/images/walleTabFilled.svg';
import VaultIcon from 'src/assets/images/vaultTab.svg';
import VaultActiveIcon from 'src/assets/images/white_icon_vault.svg';
import { hp } from 'src/common/data/responsiveness/responsive';
import { urlParamsToObj } from 'src/core/utils';
import { WalletType } from 'src/core/wallets/enums';
import useToastMessage from 'src/hooks/useToastMessage';
import { useColorMode, Box } from 'native-base';
import Fonts from 'src/common/Fonts';
import VaultScreen from './VaultScreen';
import WalletsScreen from './WalletsScreen';

function TabButton({
  label,
  Icon,
  IconActive,
  active,
  onPress,
  backgroundColorActive,
  backgroundColor,
  textColorActive,
  textColor,
}) {
  const { colorMode } = useColorMode();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        getStyles(colorMode).container,
        { backgroundColor: active ? backgroundColorActive : backgroundColor },
      ]}
    >
      {active ? <IconActive /> : <Icon />}
      <Text
        style={[
          getStyles(colorMode).label,
          {
            color: active ? textColorActive : textColor,
            fontWeight: active ? '600' : '300',
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const Tab = createBottomTabNavigator();

function NewHomeScreen({ navigation }) {
  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();
  useEffect(() => {
    Linking.addEventListener('url', handleDeepLinkEvent);
    handleDeepLinking();
    return () => {
      Linking.removeAllListeners('url');
    };
  }, []);

  function handleDeepLinkEvent({ url }) {
    if (url) {
      if (url.includes('backup')) {
        const splits = url.split('backup/');
        const decoded = Buffer.from(splits[1], 'base64').toString();
        const params = urlParamsToObj(decoded);
        if (params.seed) {
          navigation.navigate('EnterWalletDetail', {
            seed: params.seed,
            name: `${params.name.slice(0, 1).toUpperCase() + params.name.slice(1, params.name.length)} `,
            path: params.path,
            appId: params.appId,
            description: `Imported from ${params.name.slice(0, 1).toUpperCase() + params.name.slice(1, params.name.length)} `,
            type: WalletType.IMPORTED,
          });
        } else {
          showToast('Invalid deeplink');
        }
      }
    }
  }
  async function handleDeepLinking() {
    try {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        if (initialUrl.includes('backup')) {
          const splits = initialUrl.split('backup/');
          const decoded = Buffer.from(splits[1], 'base64').toString();
          const params = urlParamsToObj(decoded);
          if (params.seed) {
            navigation.navigate('EnterWalletDetail', {
              seed: params.seed,
              name: `${params.name.slice(0, 1).toUpperCase() + params.name.slice(1, params.name.length)} `,
              path: params.path,
              appId: params.appId,
              purpose: params.purpose,
              description: `Imported from ${params.name.slice(0, 1).toUpperCase() + params.name.slice(1, params.name.length)} `,
              type: WalletType.IMPORTED,
            });
          } else {
            showToast('Invalid deeplink');
          }
        } else if (initialUrl.includes('create/')) {
        }
      }
    } catch (error) {
      //
    }
  }

  function TabBarButton({ focused, state, descriptors }) {
    return (
      <Box style={styles.container}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            if (!isFocused) {
              navigation.navigate({ name: route.name, merge: true });
            }
          };

          return (
            <TabButton
              label={label === 'Wallet' ? 'Wallets' : label}
              Icon={route.name === 'Vault' ? VaultIcon : WalletIcon}
              IconActive={route.name === 'Vault' ? VaultActiveIcon : WalletActiveIcon}
              onPress={onPress}
              active={isFocused}
              backgroundColorActive={route.name === 'Vault' ? "#704E2E" : "#2D6759"}
              backgroundColor="transparent"
              textColorActive="#F7F2EC"
              textColor={route.name === 'Vault' ? "#704E2E" : "#2D6759"}
            />
          );
        })}


      </Box>
    )



  }




  return (
    <Tab.Navigator
      sceneContainerStyle={{ backgroundColor: '#F2EDE6' }}
      screenOptions={{ headerShown: false }}
      tabBar={props => <TabBarButton focused={undefined} {...props} />}
    >
      <Tab.Screen name="Wallet" component={WalletsScreen} />
      <Tab.Screen name="Vault" component={VaultScreen} />
    </Tab.Navigator >
  );
}

export default NewHomeScreen;

const getStyles = (colorMode) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    paddingHorizontal: 27,
    paddingVertical: 15,
    marginHorizontal: 10,
  },
  label: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: Fonts.RobotoCondensedRegular,
  },
  tabBarStyle: {
    backgroundColor: colorMode === 'light' ? '#F2EDE6' : '#323C3A',
    // borderTopLeftRadius: 10,
    // borderTopRightRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    height: Platform.OS === 'android' ? hp(55) : hp(80),
    paddingVertical: Platform.OS === 'android' ? hp(10) : hp(15),
  },
})
