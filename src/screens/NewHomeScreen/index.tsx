import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import WalletIcon from 'src/assets/images/whirlpooll_loader_setting_inside.svg';
import WalletsScreen from './WalletsScreen';
import VaultScreen from './VaultScreen';
import HeaderDetails from './components/HeaderDetails';

function TabButton({
  label,
  Icon,
  active,
  onPress,
  backgroundColorActive,
  backgroundColor,
  textColorActive,
  textColor,
}) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: active ? backgroundColorActive : backgroundColor,
          },
        ]}
      >
        <Icon />
        <Text
          style={[
            styles.label,
            {
              color: active ? textColorActive : textColor,
              fontWeight: active ? '700' : '400',
            },
          ]}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const Tab = createBottomTabNavigator();

function NewHomeScreen() {
  return (
    <>
      <HeaderDetails />
      <Tab.Navigator
        screenOptions={({ route, navigation }) => ({
          tabBarButton: ({ onPress }) => {
            if (route.name === 'Vault') {
              const active = navigation.isFocused('Vault');
              return (
                <TabButton
                  label="Vault"
                  Icon={WalletIcon}
                  onPress={onPress}
                  active={active}
                  backgroundColorActive="#704E2E"
                  backgroundColor="transparent"
                  textColorActive="#F7F2EC"
                  textColor="#704E2E"
                />
              );
            }
            if (route.name === 'Wallet') {
              const active = navigation.isFocused('Wallet');
              return (
                <TabButton
                  label="Wallets"
                  Icon={WalletIcon}
                  onPress={onPress}
                  active={active}
                  backgroundColorActive="#2D6759"
                  backgroundColor="transparent"
                  textColorActive="#FDF8F2"
                  textColor="#2D6759"
                />
              );
            }
          },
          tabBarStyle: {
            paddingVertical: 5,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: '#FDF7F0',
            justifyContent: 'center',
            alignItems: 'center',
            height: 70,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Wallet" component={WalletsScreen} />
        <Tab.Screen name="Vault" component={VaultScreen} />
      </Tab.Navigator>
    </>
  );
}

export default NewHomeScreen;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 5,
    margin: 10,
  },
  label: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '400',
  },
});
