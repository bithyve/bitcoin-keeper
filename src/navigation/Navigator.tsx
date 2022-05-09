import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import InheritanceScreen from 'src/screens/Inheritance/InheritanceScreen';
import HomeScreen from 'src/screens/HomeScreen';
import AddWallet from '../screens/AddWalletScreen';
import TestingBottomsheet from 'src/screens/TestingBottomsheet';
import QRscanner from 'src/screens/QRscannerScreen/QRScannerScreen';
import LoginScreen from 'src/screens/LoginScreen/LoginScreen';
import BackupScreen from 'src/screens/BackupScreen';

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
        {/* <Stack.Screen name="Lock Screen" component={LoginScreen} /> */}
        <Stack.Screen name="Home" component={HomeScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Backup" component={BackupScreen} />
        <Stack.Screen name="Inheritance" component={InheritanceScreen} />
        <Stack.Screen name="QRscanner" component={QRscanner} />
        <Stack.Screen name="AddWallet Screen" component={AddWallet} />
        <Stack.Screen name="Test" component={TestingBottomsheet} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigator;
