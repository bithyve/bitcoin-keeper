import React from 'react';

import { Text, Box } from 'native-base';

const HexaToastMessages: React.FunctionComponent<{
  title: string;
  Image: any;
}> = ({
    title,
    Image,
}) => {
    return (
        <Box bg="light.yellow1"  flexDirection = {"row"} borderRadius={10} alignItems={'center'} justifyContent={'center'} height={70} width={310} fontSize={13}>
              <Box marginLeft={5}> 
              {Image}
              </Box>
            <Text width={270} marginLeft={3}>{title}</Text>
        </Box>
    );
  };

export default HexaToastMessages;