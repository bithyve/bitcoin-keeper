import { StyleSheet, View, SafeAreaView } from 'react-native';
import React from 'react';
import { Text, useColorMode, useColorModeValue } from 'native-base'
import Fonts from '../common/Fonts';

const HomeScreen = () => {
  const {
    colorMode,
    toggleColorMode
  } = useColorMode();
  return (
    <SafeAreaView style={styles.sectionContainer}>
    <View>
      <Text style={styles.sectionTitle} fontFamily="body" fontWeight={100} onPress={toggleColorMode} color={useColorModeValue("light.light", "dark.black")} >{colorMode}</Text>
    </View>
  </SafeAreaView >
  );
};


const styles = StyleSheet.create({
  sectionContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
});
export default HomeScreen;