import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import InheritanceScreen from 'src/screens/Inheritance/InheritanceScreen';
import HomeScreen from 'src/screens/HomeScreen';
import AddWallet from '../screens/AddWalletScreen';
import TestingBottomsheet from 'src/screens/TestingBottomsheet';
import LoginScreen from 'src/screens/LoginScreen';

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
      <Stack.Navigator>
        <Stack.Screen name="Lock Screen" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="AddWallet Screen"
          component={AddWallet}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Test" component={TestingBottomsheet} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Inheritance" component={InheritanceScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigator;
