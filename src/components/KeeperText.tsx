import React from 'react';
import { TextProps } from 'react-native';
import { Text } from 'native-base';

interface KeeperTextProps extends TextProps {
  type?: 'regular' | 'bold' | 'light';
}

function KeeperText(props: KeeperTextProps) {
  const { children, type, style } = props;
  let fontWeight: number;
  switch (type) {
    case 'regular':
      fontWeight = 200;
      break;
    case 'light':
      fontWeight = 100;
      break;
    case 'bold':
      fontWeight = 300;
      break;
    default:
      fontWeight = 200;
      break;
  }
  const passedStyles = Array.isArray(style) ? Object.assign({}, ...style) : style;
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Text {...props} fontWeight={fontWeight} style={[{ ...passedStyles }]}>
      {children}
    </Text>
  );
}

KeeperText.defaultProps = {
  type: 'regular',
};

export default KeeperText;
