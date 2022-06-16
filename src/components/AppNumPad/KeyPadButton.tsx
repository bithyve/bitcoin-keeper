import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';

export interface Props {
  title: string;
  onPressNumber;
}
const KeyPadButton: React.FC<Props> = ({ title, onPressNumber }: Props) => {
  return (
    <TouchableOpacity
      // underlayColor="#dcdcdc"
      onPress={() => onPressNumber(title)}
      style={styles.keyPadElementTouchable}
    >
      <Text
        style={styles.keyPadElementText}
        // onPress={() => onPressNumber( title )}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  keyPadElementTouchable: {
    flex: 1,
    height: hp('8%'),
    fontSize: RFValue(18),
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyPadElementText: {
    color: '#F4F4F4',
    fontSize: RFValue(25),
    fontStyle: 'normal',
  },
});
export default KeyPadButton;
