import { StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import Text from 'src/components/KeeperText';

export interface Props {
  title: string;
  onPressNumber;
  keyColor: string;
}
const KeyPadButton: React.FC<Props> = ({ title, onPressNumber, keyColor }: Props) => {
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => onPressNumber(title)}
      style={styles.keyPadElementTouchable}
      testID={`key_${title}`}
    >
      <Text style={styles.keyPadElementText} color={keyColor}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  keyPadElementTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyPadElementText: {
    fontSize: 25,
    lineHeight: 30,
  },
});
export default KeyPadButton;
