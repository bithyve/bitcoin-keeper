import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { RFValue } from 'react-native-responsive-fontsize';
import React from 'react';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Fonts from 'src/common/Fonts';

export interface Props {
  title: string;
  onPressNumber;
  keyColor: string;
}
const KeyPadButton: React.FC<Props> = ({ title, onPressNumber, keyColor }: Props) => {
  const styles = getStyles(keyColor);
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => onPressNumber(title)}
      style={styles.keyPadElementTouchable}
      testID={`key_${title}`}
    >
      <Text style={styles.keyPadElementText}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
const getStyles = (keyColor) =>
  StyleSheet.create({
    keyPadElementTouchable: {
      flex: 1,
      height: hp('8%'),
      fontSize: RFValue(18),
      justifyContent: 'center',
      alignItems: 'center',
    },
    keyPadElementText: {
      color: keyColor,
      fontSize: RFValue(25),
      fontFamily: Fonts.RobotoCondensedRegular
    },
  });
export default KeyPadButton;
