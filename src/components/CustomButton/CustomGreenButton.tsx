import React from 'react';
import { TouchableHighlight, StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
export interface Props {
  value: string;
  onPress?: Function;
  disabled?: boolean;
}
function CustomGreenButton(props: Props) {
  const { colorMode } = useColorMode();
  return (
    <TouchableHighlight
      style={styles.button}
      underlayColor="none"
      disabled={props.disabled}
      onPress={() => {
        props.onPress();
      }}
    >
      <Box style={styles.buttonContent} backgroundColor={`${colorMode}.primaryGreenBackground`}>
        <Text color={`${colorMode}.white`} fontSize={13} bold letterSpacing={0.78}>
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
});

export default CustomGreenButton;
