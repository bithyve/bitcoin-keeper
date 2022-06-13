import React from 'react';
import { Box } from 'native-base';

const DotView = (props) => {
  return <Box h={props.height} w={props.width} borderRadius={6} bg={props.color} />;
};
export default DotView;
