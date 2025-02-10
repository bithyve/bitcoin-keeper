import React from 'react';
import { TouchableHighlight, StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';

export interface Props {
  value: string;
  onPress?: Function;
  disabled?: boolean;
  fullWidth?: boolean;
}
function CustomGreenButton(props: Props) {
  const { colorMode } = useColorMode();
  return (
    <TouchableHighlight
      style={[styles.button, props?.fullWidth && styles.fullWidth]}
      underlayColor="none"
      disabled={props.disabled}
      onPress={() => {
        props.onPress();
      }}
      testID="btn_customGreenButton"
    >
      <Box
        style={[
          styles.buttonContent,
          props?.fullWidth && styles.fullWidth,
          props.disabled && styles.disabledBtnOpacity,
        ]}
        backgroundColor={`${colorMode}.greenButtonBackground`}
      >
        <Text color={`${colorMode}.buttonText`} fontSize={13} bold letterSpacing={0.78}>
          {props.value}
        </Text>
      </Box>
    </TouchableHighlight>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 120,
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    width: 120,
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    flex: 1,
    width: '100%',
  },
  disabledBtnOpacity: {
    opacity: 0.5,
  },
});

export default CustomGreenButton;
