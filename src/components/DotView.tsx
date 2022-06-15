import React from 'react';
import { Box } from 'native-base';
export interface Props {
  height?: number;
  width?: number;
  color?: string;
}
const DotView = (props: Props) => {
  return <Box h={props.height} w={props.width} borderRadius={6} bg={props.color} />;
};
export default DotView;
