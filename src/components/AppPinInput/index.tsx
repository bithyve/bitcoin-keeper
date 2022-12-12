import { StyleSheet, View } from 'react-native';
import React from 'react';

function AppPinInput({ value, maxLength }) {
  const noOfChecked = value.length;
  const noOfunChecked = maxLength - noOfChecked;
  return (
    <View style={styles.container}>
      {[...Array(noOfChecked)].map((e, i) => (
        <View key={i} style={styles.circleChekced} />
      ))}
      {[...Array(noOfunChecked)].map((e, i) => (
        <View key={i} style={styles.circleUnchecked} />
      ))}
    </View>
  );
}

export default AppPinInput;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 30,
    alignItems: 'center',
  },
  circleChekced: {
    width: 12,
    height: 12,
    borderRadius: 100 / 2,
    backgroundColor: '#62C5BF',
  },
  circleUnchecked: {
    width: 9,
    height: 9,
    borderRadius: 100 / 2,
    backgroundColor: '#62C5BF20',
  },
});
