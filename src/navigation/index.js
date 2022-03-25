import { StyleSheet } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LockScreen from '../screens/LockScreen';
import HomeScreen from '../screens/HomeScreen';
import AddWallet from '../screens/AddWalletScreen';
import TestingBottomsheet from 'src/screens/TestingBottomsheet';

const Navigator = () => {
  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="AddWallet Screen"
          component={AddWallet}
          options={{ headerShown: false }}
        />
        {/* <Stack.Screen name="Test" component={TestingBottomsheet} options={{ headerShown: false }} /> */}
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Lock Screen" component={LockScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigator;

const styles = StyleSheet.create({});
