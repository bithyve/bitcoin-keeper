import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import Fonts from 'src/common/Fonts';

function CharButton({ char, Icon, pressHandler, color, height }) {
  return (
    <TouchableOpacity onPress={() => pressHandler(char)} style={{ ...styles.charContainer, height }}>
      {Icon ? <View style={styles.icon}>{Icon}</View> : <Text style={{ ...styles.char, color }}>{char}</Text>}
    </TouchableOpacity>
  );
}

export default CharButton;

const styles = StyleSheet.create({
  charContainer: {
    width: '33%',
    justifyContent: 'center'
  },
  char: {
    textAlign: 'center',
    fontSize: 25,
    color: '#041513',
    fontFamily: Fonts.RobotoCondensedRegular
  },
  icon: {
    alignSelf: 'center'
  },
});
