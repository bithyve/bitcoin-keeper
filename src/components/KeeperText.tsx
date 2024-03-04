import React from 'react';
import { TextProps } from 'react-native';
import { Text as NativeBaseText } from 'native-base';

interface KeeperTextProps extends TextProps {
  // eslint-disable-next-line react/require-default-props
  color?: string;
  fontSize?: number;
  bold?: boolean;
  light?: boolean;
  italic?: boolean;
  medium?: boolean;
  semiBold?: boolean;
}

function Text(props: KeeperTextProps) {
  const { children, style, fontSize, medium, semiBold, bold, light, italic } = props;
  let fontWeight = 200;
  if (bold) {
    fontWeight = 500;
  } else if (light) {
    fontWeight = 100;
  } else if (medium) {
    fontWeight = 300;
  } else if (semiBold) {
    fontWeight = 400;
  }

  const updatedProps = { ...props, bold: undefined, light: undefined };

  const passedStyles = Array.isArray(style) ? Object.assign({}, ...style) : style;
  return (
    <NativeBaseText
      {...updatedProps}
      fontSize={fontSize}
      fontWeight={fontWeight}
      fontStyle={italic && 'italic'}
      style={[{ ...passedStyles }]}
    >
      {children}
    </NativeBaseText>
  );
}

Text.defaultProps = {
  bold: false,
  light: false,
};

export default Text;
