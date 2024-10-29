import { StyleSheet, Text } from 'react-native';

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

// Just testing things out here (dev only)
function TestingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text>Test anything here</Text>
    </SafeAreaView>
  );
}

export default TestingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
