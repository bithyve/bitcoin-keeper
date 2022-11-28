import { StyleSheet, View } from 'react-native';

import CharButton from './CharButton';
import DeleteDarkIcon from 'src/assets/images/delete.svg';
import DeleteIcon from 'src/assets/icons/delete.svg';
import React from 'react';

const AppNumPad = ({
  ok = null,
  clear,
  setValue,
  disable = false,
  color = '#FDF7F0',
  height = 70,
  darkDeleteIcon = false,
}) => {
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
        if (char === 'ok' && ok) {
          return <CharButton key={char} char={''} color={color} height={height} />;
        } else if (char === 'clear' && clear) {
          return (
            <CharButton
              Icon={darkDeleteIcon ? <DeleteDarkIcon /> : <DeleteIcon />}
              pressHandler={onClear}
              key={char}
              color={color}
              height={height}
            />
          );
        } else if (typeof char === 'number') {
          return (
            <CharButton
              char={char}
              pressHandler={onCharInput}
              key={char}
              color={color}
              height={height}
            />
          );
        } else return <CharButton char={' '} key={char} height={height} />;
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
