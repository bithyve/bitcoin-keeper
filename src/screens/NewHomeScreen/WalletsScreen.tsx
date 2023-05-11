import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { ScaledSheet } from 'react-native-size-matters';

const WalletsScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Wallets Screen</Text>
    </View>
  );
};

export default WalletsScreen;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F2EC',
    paddingVertical: '15@s',
    paddingHorizontal: '20@s',
    position: 'relative',
  },
});
