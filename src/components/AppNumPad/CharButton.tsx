import { StyleSheet, View, TouchableOpacity } from 'react-native';
import React from 'react';
import Text from 'src/components/KeeperText';

function CharButton({ char, Icon, pressHandler, color, height }) {
  return (
    <TouchableOpacity
      onPress={() => pressHandler(char)}
      style={{ ...styles.charContainer, height }}
    >
      {Icon ? (
        <View style={styles.icon}>{Icon}</View>
      ) : (
        <Text style={styles.char} color={color}>
          {char}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default CharButton;

const styles = StyleSheet.create({
  charContainer: {
    width: '33%',
    justifyContent: 'center',
  },
  char: {
    textAlign: 'center',
    fontSize: 25,
    lineHeight: 25,
  },
  icon: {
    alignSelf: 'center',
  },
});
