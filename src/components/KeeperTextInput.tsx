import { StyleSheet } from 'react-native';
import React from 'react';
import { Input, useColorMode, Box } from 'native-base';
import KeeperText from './KeeperText';
import Colors from 'src/theme/Colors';
import Fonts from 'src/constants/Fonts';

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
  ...props
}) {
  const { colorMode } = useColorMode();
  return (
    <Box
      backgroundColor={inpuBackgroundColor || `${colorMode}.seashellWhite`}
      style={styles.container}
      borderColor={inpuBorderColor || `${colorMode}.greyBorder`}
    >
      <Input
        variant={'unstyled'}
        defaultValue={defaultValue}
        ref={inputRef}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor || `${colorMode}.placeHolderTextColor`}
        borderColor={isError ? Colors.CarmineRed : 'transparent'}
        color={isError ? Colors.CarmineRed : `${colorMode}.primaryText`}
        value={value}
        fontFamily={value === '' ? 'Inter' : Fonts.FiraSansSemiBold}
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
          maxLength ? (
            <Box>
              <KeeperText color={`${colorMode}.GreyText`} bold style={styles.limitText}>
                {value ? value.length : '0'}/{maxLength}
              </KeeperText>
            </Box>
          ) : (
            InputRightComponent
          )
        }
        backgroundColor={`${colorMode}.ChampagneBliss`}
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
});
