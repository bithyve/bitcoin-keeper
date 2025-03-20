import React from 'react';
import { TouchableHighlight, StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';

export interface Props {
  value: string;
  onPress?: Function;
  disabled?: boolean;
  titleColor?: string;
  backgroundColor?: string;
  boldTitle?: boolean;
}
function CustomYellowButton(props: Props) {
  const { colorMode } = useColorMode();
  return (
    <TouchableHighlight
      disabled={props.disabled}
      underlayColor="none"
      onPress={() => {
        props.onPress();
      }}
      testID="btn_customYellowButton"
    >
      <Box
        style={styles.buttonContent}
        backgroundColor={props.backgroundColor || `${colorMode}.accent`}
      >
        <Text bold={props.boldTitle} color={props.titleColor} style={styles.btnText}>
          {props.value}
        </Text>
      </Box>
    </TouchableHighlight>
  );
}

const styles = StyleSheet.create({
  buttonContent: {
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderColor: '#725436',
    borderWidth: 0.6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    letterSpacing: 1,
    fontSize: 14,
  },
});

export default CustomYellowButton;
