import { StyleSheet } from 'react-native';
import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LockScreen from '../screens/LockScreen';
import HomeScreen from '../screens/HomeScreen';
import InheritanceScreen from 'src/screens/Inheritance/InheritanceScreen';
import AddWallet from '../screens/AddWalletScreen';
import TestingBottomsheet from 'src/screens/TestingBottomsheet';

const defaultTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#FDF7F0',
  },
};
const Navigator = () => {
  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer theme={defaultTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Inheritance" component={InheritanceScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Test" component={TestingBottomsheet} />
        <Stack.Screen name="AddWallet Screen" component={AddWallet} />
        <Stack.Screen name="Lock Screen" component={LockScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigator;

const styles = StyleSheet.create({});
