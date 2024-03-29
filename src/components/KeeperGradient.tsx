import React from 'react';
import { Box, IBoxProps } from 'native-base';

interface IKeeperGradientProps extends IBoxProps {
  colors: Array<string>;
  start?: Array<number>;
  end?: Array<number>;
  location?: Array<number>;
}

KeeperGradient.defaultProps = {
  start: undefined,
  end: undefined,
  location: undefined,
};

function KeeperGradient(props: IKeeperGradientProps) {
  const { children, colors, start, end, location } = props;
  const updatedProps = {
    ...props,
    colors: undefined,
    start: undefined,
    end: undefined,
    location: undefined,
  };
  return (
    <Box {...updatedProps} backgroundColor={colors[0]}>
      {children}
    </Box>
  );
}

export default KeeperGradient;
