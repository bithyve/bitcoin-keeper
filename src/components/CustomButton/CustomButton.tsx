import { ActivityIndicator, StyleSheet, TouchableHighlight } from 'react-native';
import React from 'react';
import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';

export interface Props {
  value: string;
  onPress?: Function;
  disabled?: boolean;
  testID?: string;
  loading?: boolean;
}
function CustomButton({ value, onPress, disabled, testID, loading = false }: Props) {
  const { colorMode } = useColorMode();
  if (loading) {
    return <ActivityIndicator />;
  }
  return (
    <TouchableHighlight
      style={[styles.button, { opacity: disabled ? 0.7 : 1 }]}
      disabled={disabled}
      underlayColor="none"
      testID={testID || 'customButton'}
      onPress={() => {
        onPress();
      }}
    >
      <Box style={styles.buttonContent} backgroundColor={`${colorMode}.modalWhiteButton`}>
        <Text color={`${colorMode}.textGreen`} fontSize={12} bold>
          {value}
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

export default CustomButton;
