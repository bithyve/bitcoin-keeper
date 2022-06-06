import React from 'react';
import { StyleSheet, TouchableHighlight } from 'react-native';
import { Box, Text } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import KeyPadButton from './KeyPadButton';

export interface Props {
  onPressNumber;
  disabled?;
}
const KeyPadView: React.FC<Props> = ({ onPressNumber, disabled = false }: Props) => {
  return (
    <Box pointerEvents={disabled ? 'none' : 'auto'} mt={'auto'} mb={10}>
      <Box flexDirection={'row'} height={hp('8%')}>
        <KeyPadButton title="1" onPressNumber={() => onPressNumber('1')} />
        <KeyPadButton title="2" onPressNumber={() => onPressNumber('2')} />
        <KeyPadButton title="3" onPressNumber={() => onPressNumber('3')} />
      </Box>
      <Box flexDirection={'row'} height={hp('8%')}>
        <KeyPadButton title="4" onPressNumber={() => onPressNumber('4')} />
        <KeyPadButton title="5" onPressNumber={() => onPressNumber('5')} />
        <KeyPadButton title="6" onPressNumber={() => onPressNumber('6')} />
      </Box>
      <Box flexDirection={'row'} height={hp('8%')}>
        <KeyPadButton title="7" onPressNumber={() => onPressNumber('7')} />
        <KeyPadButton title="8" onPressNumber={() => onPressNumber('8')} />
        <KeyPadButton title="9" onPressNumber={() => onPressNumber('9')} />
      </Box>
      <Box flexDirection={'row'} height={hp('8%')}>
        <Box
          flex={1}
          height={hp('8%')}
          fontSize={RFValue(18)}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <Text flex={1} p={15}></Text>
        </Box>
        <TouchableHighlight
          onPress={() => onPressNumber('0')}
          underlayColor="#dcdcdc"
          style={styles.keyPadElementTouchable}
        >
          <Text color={'#F4F4F4'} fontSize={RFValue(25)} fontStyle={'normal'}>
            0
          </Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={() => onPressNumber('x')}
          underlayColor="#dcdcdc"
          style={styles.keyPadElementTouchable}
        >
          <Text color={'#F4F4F4'} fontSize={RFValue(25)} fontStyle={'normal'}>
            <Ionicons name="ios-backspace" size={30} color={'#F4F4F4'} />
          </Text>
        </TouchableHighlight>
      </Box>
    </Box>
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
});
export default KeyPadView;
