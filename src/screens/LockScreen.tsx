import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

const LockScreen = () => {
  return (
    <View style={styles.screen}>
      <Text>LockScreen</Text>
    </View>
  );
};

export default LockScreen;

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
