import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import CharButton from './CharButton';
import DeleteIcon from 'src/assets/icons/delete.svg';

const AppNumPad = ({ ok, clear, setValue, disable = false }) => {
  const numPadArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'ok', 0, 'clear'];

  const onCharInput = (char) => {
    if (!disable) {
      setValue((currState) => {
        return currState + char;
      });
    }
  };

  const onClear = () => {
    setValue((currState) => currState.slice(0, -1));
  };

  return (
    <View style={styles.numPadContainer}>
      {numPadArr.map((char) => {
        if ((char === 'ok') & ok) {
          return <CharButton key={char} />;
        } else if (char === 'clear' && clear) {
          return <CharButton Icon={<DeleteIcon />} pressHandler={onClear} key={char} />;
        } else if (typeof char === 'number') {
          return <CharButton char={char} pressHandler={onCharInput} key={char} />;
        } else return <CharButton char={' '} key={char} />;
      })}
    </View>
  );
};

export default AppNumPad;

const styles = StyleSheet.create({
  numPadContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
