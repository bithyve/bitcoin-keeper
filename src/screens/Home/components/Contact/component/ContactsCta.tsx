import { Box, useColorMode } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Text from 'src/components/KeeperText';
import { hp } from 'src/constants/responsive';

export const ContactsCta = ({
  onPress,
  paddingHorizontal = 0,
  paddingVertical = hp(15),
  width = null,
  borderColor = 'transparent',
  backgroundColor = null,
  LeftIcon = null,
  primaryTextColor = null,
  primaryFontWeight = 'medium',
  text,
}) => {
  const { colorMode } = useColorMode();
  return (
    <TouchableOpacity onPress={onPress} testID="btn_primaryText" style={{}}>
      <Box
        style={[
          styles.createBtn,
          {
            paddingHorizontal: width ? 0 : paddingHorizontal,
            paddingVertical,
            width,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            gap: 8,
            borderRadius: 10,
            borderWidth: 1,
          },
        ]}
        borderColor={borderColor}
        backgroundColor={backgroundColor || `${colorMode}.pantoneGreen`}
      >
        <>
          {LeftIcon && <LeftIcon />}
          <Text
            numberOfLines={1}
            style={styles.btnText}
            color={primaryTextColor || `${colorMode}.buttonText`}
            fontWeight={primaryFontWeight}
          >
            {text}
          </Text>
        </>
      </Box>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtn: {
    paddingVertical: hp(15),
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  btnText: {
    fontSize: 14,
  },
});
