import { Pressable, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { Input, useColorMode, Box } from 'native-base';
import Colors from 'src/theme/Colors';
import KeeperText from './KeeperText';
import EyeOpen from 'src/assets/images/eye_open.svg';
import EyeClose from 'src/assets/images/eye_close.svg';

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
  isError = false,
  onBlur = (_) => {},
  onFocus = (_) => {},
  InputRightComponent = null,
  inpuBackgroundColor = null,
  inpuBorderColor = null,
  isPassword = false,
  ...props
}) {
  const { colorMode } = useColorMode();
  const [passwordVisible, setPasswordVisible] = useState(false);
  return (
    <Box
      backgroundColor={inpuBackgroundColor || `${colorMode}.seashellWhite`}
      style={styles.container}
      borderColor={inpuBorderColor || `${colorMode}.greyBorder`}
    >
      <Input
        secureTextEntry={isPassword && !passwordVisible}
        variant="unstyled"
        defaultValue={defaultValue}
        ref={inputRef}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor || `${colorMode}.placeHolderTextColor`}
        borderColor={isError ? Colors.CarmineRed : 'transparent'}
        color={isError ? Colors.CarmineRed : `${colorMode}.primaryText`}
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
        onBlur={onBlur}
        onFocus={onFocus}
        InputRightElement={
          isPassword ? (
            <Pressable style={styles.eyeCtr} onPress={() => setPasswordVisible(!passwordVisible)}>
              {passwordVisible ? <EyeOpen /> : <EyeClose />}
            </Pressable>
          ) : maxLength ? (
            <Box>
              {inputRef}
              <KeeperText color={`${colorMode}.GreyText`} bold style={styles.limitText}>
                {value ? value.length : inputRef ? inputRef : '0'}/{maxLength}
              </KeeperText>
            </Box>
          ) : (
            InputRightComponent
          )
        }
        backgroundColor={`${colorMode}.textInputBackground`}
        _input={
          colorMode === 'dark' && {
            selectionColor: Colors.SecondaryWhite,
            cursorColor: Colors.SecondaryWhite,
          }
        }
        {...props}
      />
    </Box>
  );
}

export default KeeperTextInput;

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
  },
  inputField: {
    fontSize: 12,
  },
  limitText: {
    marginRight: 10,
    fontSize: 12,
    alignSelf: 'flex-end',
  },
  eyeCtr: {
    justifyContent: 'center',
    paddingRight: 10,
  },
});
