/* eslint-disable react/no-unstable-nested-components */
import { Linking, StyleSheet, Text, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import WalletIcon from 'src/assets/images/walletTab.svg';
import WalletActiveIcon from 'src/assets/images/walleTabFilled.svg';
import walletDark from 'src/assets/images/walletDark.svg'
import VaultIcon from 'src/assets/images/vaultTab.svg';
import VaultActiveIcon from 'src/assets/images/white_icon_vault.svg';
import VaultDark from 'src/assets/images/vaultDark.svg';
import { urlParamsToObj } from 'src/core/utils';
import { WalletType } from 'src/core/wallets/enums';
import useToastMessage from 'src/hooks/useToastMessage';
import Fonts from 'src/common/Fonts';
import { Box, useColorMode } from 'native-base';
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
  const styles = getStyles(colorMode);
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        { backgroundColor: active ? backgroundColorActive : backgroundColor, borderRadius: 20 },
      ]}
    >
      {active ? <IconActive /> : <Icon />}
      <Text
        style={[
          styles.label,
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
    const { colorMode } = useColorMode();
    const styles = getStyles(colorMode);
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
          const themeWalletActive = colorMode === 'light' ? "#2D6759" : "#89AEA7"
          const themeVaultActive = colorMode === 'light' ? "#704E2E" : "#e3be96"
          const textWalletColor = colorMode === 'light' ? "#2D6759" : "#89AEA7"
          const textVaultColor = colorMode === 'light' ? "#704E2E" : "#e3be96"
          const vaultActiveIcon = colorMode === 'light' ? VaultActiveIcon : VaultDark
          const walletActiveIcon = colorMode === 'light' ? WalletActiveIcon : walletDark
          return (
            <TabButton
              label={label === 'Wallet' ? 'Wallets' : label}
              Icon={route.name === 'Vault' ? VaultIcon : WalletIcon}
              IconActive={route.name === 'Vault' ? vaultActiveIcon : walletActiveIcon}
              onPress={onPress}
              active={isFocused}
              backgroundColorActive={route.name === 'Vault' ? themeVaultActive : themeWalletActive}
              backgroundColor="transparent"
              textColorActive={colorMode === 'light' ? "#F7F2EC" : "#24312E"}
              textColor={route.name === 'Vault' ? textVaultColor : textWalletColor}
            />
          );
        })}


      </Box>
    )
  }
  const { colorMode } = useColorMode();
  const styles = getStyles(colorMode);
  return (
    <Tab.Navigator
      sceneContainerStyle={styles.tabContainer}
      screenOptions={{
        headerShown: false
      }}
      tabBar={props => <TabBarButton focused={undefined} {...props} />}
    >
      <Tab.Screen name="Wallet" component={WalletsScreen} />
      <Tab.Screen name="Vault" component={VaultScreen} />
    </Tab.Navigator>
  );
}

export default NewHomeScreen;

const getStyles = (colorMode) => StyleSheet.create({
  container: {
    backgroundColor: colorMode === 'light' ? '#FDF7F0' : '#48514F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // borderRadius: 30,
    paddingHorizontal: 27,
    paddingVertical: 15,
    // marginHorizontal: 10,
  },
  tabContainer: {
    backgroundColor: colorMode === 'light' ? '#F2EDE6' : '#323C3A'
  },
  label: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: Fonts.RobotoCondensedRegular,
  },
})