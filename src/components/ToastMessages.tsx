import { Box, Text } from 'native-base';

import React from 'react';
import { windowWidth } from 'src/common/data/responsiveness/responsive';

const HexaToastMessages: React.FunctionComponent<{
  title: string;
  Image?: any;
  error?: boolean;
}> = ({ title, Image, error }) => (
  <Box
    bg={error ? 'error.500' : 'light.yellow1'}
    flexDirection="row"
    borderRadius={10}
    alignItems="center"
    justifyContent="center"
    height={70}
    width={windowWidth * 0.8}
    fontSize={13}
  >
    {Image && <Box marginLeft={5}>{Image}</Box>}
    <Text marginLeft={Image ? 3 : 0} color={error ? 'error.200' : null}>
      {title}
    </Text>
  </Box>
);

export default HexaToastMessages;
