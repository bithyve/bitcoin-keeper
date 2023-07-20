/* eslint-disable react/function-component-definition */
/* eslint-disable react/require-default-props */
import { Box } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';

import DeleteIcon from 'src/assets/images/delete.svg';
import React from 'react';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Text from 'src/components/KeeperText';
import KeyPadButton from './KeyPadButton';

export interface Props {
  onPressNumber;
  onDeletePressed;
  disabled?;
  keyColor?: string;
  ClearIcon?: JSX.Element;
}
const KeyPadView: React.FC<Props> = ({
  onPressNumber,
  onDeletePressed,
  disabled = false,
  keyColor = '#CDD8D6',
  ClearIcon = <DeleteIcon />,
}: Props) => (
  <Box pointerEvents={disabled ? 'none' : 'auto'} mt="auto">
    <Box style={styles.keyWrapperView}>
      <KeyPadButton title="1" onPressNumber={() => onPressNumber('1')} keyColor={keyColor} />
      <KeyPadButton title="2" onPressNumber={() => onPressNumber('2')} keyColor={keyColor} />
      <KeyPadButton title="3" onPressNumber={() => onPressNumber('3')} keyColor={keyColor} />
    </Box>
    <Box style={styles.keyWrapperView}>
      <KeyPadButton title="4" onPressNumber={() => onPressNumber('4')} keyColor={keyColor} />
      <KeyPadButton title="5" onPressNumber={() => onPressNumber('5')} keyColor={keyColor} />
      <KeyPadButton title="6" onPressNumber={() => onPressNumber('6')} keyColor={keyColor} />
    </Box>
    <Box style={styles.keyWrapperView}>
      <KeyPadButton title="7" onPressNumber={() => onPressNumber('7')} keyColor={keyColor} />
      <KeyPadButton title="8" onPressNumber={() => onPressNumber('8')} keyColor={keyColor} />
      <KeyPadButton title="9" onPressNumber={() => onPressNumber('9')} keyColor={keyColor} />
    </Box>
    <Box flexDirection="row" height={hp('8%')}>
      <Box style={styles.emptyBtnView}>
        <Text flex={1} padding={15} />
      </Box>
      <KeyPadButton title="0" onPressNumber={() => onPressNumber('0')} keyColor={keyColor} />
      <TouchableOpacity
        onPress={() => onDeletePressed()}
        activeOpacity={0.5}
        testID="btn_clear"
        style={styles.keyPadElementTouchable}
      >
        {ClearIcon}
      </TouchableOpacity>
    </Box>
  </Box>
);
const styles = StyleSheet.create({
  keyPadElementTouchable: {
    flex: 1,
    height: hp('8%'),
    fontSize: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyWrapperView: {
    flexDirection: 'row',
    height: hp('8%'),
  },
  emptyBtnView: {
    flex: 1,
    height: hp('8%'),
    fontSize: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default KeyPadView;
