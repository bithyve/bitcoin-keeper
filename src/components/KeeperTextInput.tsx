import { StyleSheet } from 'react-native';
import React from 'react';
import { Input, useColorMode, Box } from 'native-base';
import KeeperText from './KeeperText';

function KeeperTextInput({
  placeholder,
  placeholderTextColor = null,
  onChangeText,
  testID,
  value = null,
  defaultValue = null,
  maxLength = null,
  inputRef = null,
  height = 10,
}) {
  const { colorMode } = useColorMode();
  return (
    <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.container}>
      <Input
        defaultValue={defaultValue}
        ref={inputRef}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor || `${colorMode}.greenText`}
        value={value}
        onChangeText={onChangeText}
        style={styles.inputField}
        borderWidth={0}
        h={height}
        maxLength={maxLength}
        testID={`input_${testID}`}
        InputRightElement={
          maxLength ? (
            <KeeperText color={`${colorMode}.GreyText`} style={styles.limitText}>
              {value ? value.length : '0'}/{maxLength}
            </KeeperText>
          ) : null
        }
        backgroundColor={`${colorMode}.seashellWhite`}
      />
    </Box>
  );
}

export default KeeperTextInput;

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    marginVertical: 10,
  },
  inputField: {
    fontSize: 13,
    letterSpacing: 0.96,
  },
  limitText: {
    marginRight: 10,
    fontSize: 10,
    alignSelf: 'flex-end',
  },
});
