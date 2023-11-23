import { StyleSheet } from 'react-native';
import React from 'react';
import { Input, useColorMode, Box } from 'native-base';
import KeeperText from './KeeperText';

const KeeperTextInput = ({
  placeholder,
  onChangeText,
  testID,
  value = null,
  defaultValue = null,
  maxLength = null,
  inputRef = null,
}) => {
  const { colorMode } = useColorMode();
  return (
    <Box backgroundColor={`${colorMode}.seashellWhite`}>
      <Input
        defaultValue={defaultValue}
        ref={inputRef}
        placeholder={placeholder}
        placeholderTextColor={`${colorMode}.greenText`}
        value={value}
        onChangeText={onChangeText}
        style={styles.inputField}
        borderRadius={10}
        borderWidth={0}
        maxLength={maxLength}
        testID={`input_${testID}`}
        backgroundColor={`${colorMode}.seashellWhite`}
      />
      {maxLength ? (
        <KeeperText color={`${colorMode}.GreyText`} style={styles.limitText}>
          {value ? value.length : '0'}/{maxLength}
        </KeeperText>
      ) : null}
    </Box>
  );
};

export default KeeperTextInput;

const styles = StyleSheet.create({
  inputField: {
    color: '#073E39',
    marginVertical: 10,
    fontSize: 13,
    letterSpacing: 0.96,
  },
  limitText: {
    marginRight: 10,
    fontSize: 10,
    alignSelf: 'flex-end',
  },
});
