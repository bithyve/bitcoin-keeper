import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import Colors from 'src/theme/Colors';
import Text from './KeeperText';
import { useColorMode } from 'native-base';
import { TextStyle } from 'react-native';

type BrownButtonProps = {
  onPress: () => void;
  title: string;
  customContainerStyle?: ViewStyle;
  customTextStyle?: TextStyle;
  customTextColor?: string;
  disabled?: boolean;
};

export const BrownButton = (props: BrownButtonProps) => {
  const { colorMode } = useColorMode();
  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={[styles.container, props.customContainerStyle, props.disabled && { opacity: 0.5 }]}
    >
      <Text
        style={[styles.text, props.customTextStyle]}
        bold
        color={props.customTextColor ?? `${colorMode}.brownColor`}
      >
        {props.title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.LightBrown,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.brownColor,
  },
  text: {
    fontSize: 14,
  },
});
