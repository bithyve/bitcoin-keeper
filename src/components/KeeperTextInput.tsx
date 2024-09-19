import { StyleSheet } from 'react-native';
import React from 'react';
import { Input, useColorMode, Box } from 'native-base';
import KeeperText from './KeeperText';

function KeeperTextInput({
  placeholder,
  placeholderTextColor = null,
  onChangeText,
  testID = null,
  value = null,
  defaultValue = null,
  maxLength = null,
  inputRef = null,
  height = 55,
  ...props
}) {
  const { colorMode } = useColorMode();
  return (
    <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.container}>
      <Input
        variant={'unstyled'}
        defaultValue={defaultValue}
        ref={inputRef}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor || `${colorMode}.placeHolderTextColor`}
        value={value}
        onChangeText={onChangeText}
        style={styles.inputField}
        borderWidth={1}
        borderRadius={10}
        h={height}
        maxLength={maxLength}
        {...props}
        testID={`input_${testID}`}
        _focus={{ borderColor: `${colorMode}.greenText` }}
        InputRightElement={
          maxLength ? (
            <Box>
              <KeeperText color={`${colorMode}.GreyText`} bold style={styles.limitText}>
                {value ? value.length : '0'}/{maxLength}
              </KeeperText>
            </Box>
          ) : null
        }
        backgroundColor={`${colorMode}.ChampagneBliss`}
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
    fontSize: 12,
    letterSpacing: 0.96,
  },
  limitText: {
    marginRight: 10,
    fontSize: 12,
    alignSelf: 'flex-end',
  },
});
