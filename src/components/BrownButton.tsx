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
  subTitle?: string;
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
        color={props.customTextColor ?? `${colorMode}.BrownNeedHelp`}
      >
        {props.title}
      </Text>
      {props.subTitle && (
        <Text
          style={[styles.subText]}
          bold
          color={props.customTextColor ?? `${colorMode}.BrownNeedHelp`}
        >
          {props.subTitle}
        </Text>
      )}
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
    borderColor: Colors.primaryBrown,
  },
  text: {
    fontSize: 14,
  },
  subText: {
    fontSize: 12,
  },
});
