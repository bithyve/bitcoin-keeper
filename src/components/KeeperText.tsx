import React from 'react';
import { TextProps } from 'react-native';
import { Text as NativeBaseText } from 'native-base';

interface KeeperTextProps extends TextProps {
  // eslint-disable-next-line react/require-default-props
  color?: string;
  bold?: boolean;
  light?: boolean;
}

function Text(props: KeeperTextProps) {
  const { children, style, bold, light } = props;
  let fontWeight = 200;
  if (bold) {
    fontWeight = 300;
  } else if (light) {
    fontWeight = 100;
  } else {
    fontWeight = 200;
  }

  const updatedProps = { ...props, bold: undefined, light: undefined };

  const passedStyles = Array.isArray(style) ? Object.assign({}, ...style) : style;
  return (
    <NativeBaseText {...updatedProps} fontWeight={fontWeight} style={[{ ...passedStyles }]}>
      {children}
    </NativeBaseText>
  );
}

Text.defaultProps = {
  bold: false,
  light: false,
};

export default Text;
