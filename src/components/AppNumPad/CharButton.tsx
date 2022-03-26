import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';

const CharButton = ({ char, Icon, pressHandler }) => {
  return (
    <View style={styles.charContainer}>
      <TouchableOpacity onPress={() => pressHandler(char)}>
        {Icon ? <View style={styles.icon}>{Icon}</View> : <Text style={styles.char}>{char}</Text>}
      </TouchableOpacity>
    </View>
  );
};

export default CharButton;

const styles = StyleSheet.create({
  charContainer: { width: '33%', height: 70, justifyContent: 'center' },
  char: { textAlign: 'center', fontSize: 20, color: '#FDF7F0' },
  icon: { alignSelf: 'center' },
});
