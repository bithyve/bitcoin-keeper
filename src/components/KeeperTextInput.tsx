import { StyleSheet } from 'react-native';
import React from 'react';
import { Input, useColorMode, Box } from 'native-base';
import KeeperText from './KeeperText';
import Colors from 'src/theme/Colors';

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
  isError = false,
  onBlur = () => {},
  onFocus = () => {},
}) {
  const { colorMode } = useColorMode();
  return (
    <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.container}>
      <Input
        variant={'unstyled'}
        onBlur={onBlur}
        onFocus={onFocus}
        defaultValue={defaultValue}
        ref={inputRef}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor || `${colorMode}.placeHolderTextColor`}
        value={value}
        onChangeText={onChangeText}
        style={styles.inputField}
        borderRadius={10}
        borderWidth={isError ? 1 : 0}
        borderColor={isError ? Colors.CarmineRed : 'transparent'}
        color={isError ? Colors.CarmineRed : `${colorMode}.primaryText`}
        h={height}
        maxLength={maxLength}
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
    fontSize: 12,
    letterSpacing: 0.96,
  },
  limitText: {
    marginRight: 10,
    fontSize: 12,
    alignSelf: 'flex-end',
  },
});
