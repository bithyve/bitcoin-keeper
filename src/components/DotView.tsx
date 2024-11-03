import React from 'react';
import { Box } from 'native-base';

export interface Props {
  height?: number;
  width?: number;
  color?: string;
}
function DotView(props: Props) {
  return (
    <Box h={props.height} width={props.width} borderRadius={50} backgroundColor={props.color} />
  );
}
export default DotView;
