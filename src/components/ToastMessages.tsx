import { Box, Text } from 'native-base';

import React from 'react';

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
      width={310}
      fontSize={13}
    >
      <Box marginLeft={5}>{Image}</Box>
      <Text width={270} marginLeft={3} color={error ? 'error.200' : null}>
        {title}
      </Text>
    </Box>
  );

export default HexaToastMessages;
