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
  fontWeight?: string | number;
}

function Text(props: KeeperTextProps) {
  const { children, style, fontSize, medium, semiBold, bold, light, italic, fontWeight } = props;

  let computedFontWeight: string | number = fontWeight || 400;

  if (!fontWeight) {
    if (bold) {
      computedFontWeight = 700;
    } else if (light) {
      computedFontWeight = 300;
    } else if (medium) {
      computedFontWeight = 500;
    } else if (semiBold) {
      computedFontWeight = 600;
    } else {
      computedFontWeight = 400;
    }
  }

  const updatedProps = {
    ...props,
    bold: undefined,
    light: undefined,
    medium: undefined,
    semiBold: undefined,
  };

  const passedStyles = Array.isArray(style) ? Object.assign({}, ...style) : style;

  return (
    <NativeBaseText
      {...updatedProps}
      fontStyle={italic ? 'italic' : undefined}
      style={[{ fontSize, fontWeight: computedFontWeight }, passedStyles]}
    >
      {children}
    </NativeBaseText>
  );
}

Text.defaultProps = {
  bold: false,
  light: false,
  fontWeight: undefined,
};

export default Text;
