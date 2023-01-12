import React from 'react';
import { Box } from 'native-base';

function Scale({ scale, children }: { scale: number; children }) {
  return <Box style={{ transform: [{ scale }] }}>{children}</Box>;
}

export default Scale;
