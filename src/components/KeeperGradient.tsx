import React from 'react';
import { Box, IBoxProps } from 'native-base';

interface IKeeperGradientProps extends IBoxProps {
  colors: Array<string>;
  start?: Array<number>;
  end?: Array<number>;
  location?: Array<number>;
}

function KeeperGradient(props: IKeeperGradientProps) {
  const { children, colors } = props;
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
