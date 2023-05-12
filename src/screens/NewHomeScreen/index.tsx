/* eslint-disable react/no-unstable-nested-components */
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import React, { useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import WalletIcon from 'src/assets/images/walletTab.svg';
import WalletActiveIcon from 'src/assets/images/walleTabFilled.svg';
import VaultIcon from 'src/assets/images/vaultTab.svg';
import VaultActiveIcon from 'src/assets/images/white_icon_vault.svg'
import { hp } from 'src/common/data/responsiveness/responsive';
import WalletsScreen from './WalletsScreen';
import VaultScreen from './VaultScreen';

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
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        { backgroundColor: active ? backgroundColorActive : backgroundColor },
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

function NewHomeScreen() {
  const TabBarButton = useCallback(({ onPress, navigation, route }) => {
    if (route.name === 'Vault') {
      const active = navigation.isFocused('Vault');
      return (
        <TabButton
          label="Vault"
          Icon={VaultIcon}
          IconActive={VaultActiveIcon}
          onPress={onPress}
          active={active}
          backgroundColorActive="#704E2E"
          backgroundColor="transparent"
          textColorActive="#F7F2EC"
          textColor="#704E2E"
        />
      );
    }
    const active = navigation.isFocused('Wallet');
    return (
      <TabButton
        label="Wallets"
        Icon={WalletIcon}
        IconActive={WalletActiveIcon}
        onPress={onPress}
        active={active}
        backgroundColorActive="#2D6759"
        backgroundColor="transparent"
        textColorActive="#FDF8F2"
        textColor="#2D6759"
      />
    );
  }, []);

  return (
    <Tab.Navigator
      sceneContainerStyle={{ backgroundColor: '#F2EDE6' }}
      screenOptions={({ route, navigation }) => ({
        tabBarButton: ({ onPress }) => (
          <TabBarButton onPress={onPress} route={route} navigation={navigation} />
        ),
        tabBarStyle: styles.tabBarStyle,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Wallet" component={WalletsScreen} />
      <Tab.Screen name="Vault" component={VaultScreen} />
    </Tab.Navigator>
  );
}

export default NewHomeScreen;

const styles = StyleSheet.create({
  container: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    paddingHorizontal: 27,
    paddingVertical: 12,
    marginHorizontal: 10,
  },
  label: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '400',
  },
  tabBarStyle: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#FDF7F0',
    justifyContent: 'center',
    alignItems: 'center',
    height: hp(100),
    paddingTop: hp(17),
  },
});
