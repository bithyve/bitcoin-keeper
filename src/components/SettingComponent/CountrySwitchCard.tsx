import React from 'react';
import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';

function CountrySwitchCard(props) {
  const { colorMode } = useColorMode();
  return (
    <Box
      backgroundColor={`${colorMode}.backgroundColor2`}
      flexDirection="row"
      justifyContent="space-evenly"
      mx={7}
      padding={3}
      borderRadius={10}
      {...props}
    >
      <Box flex={1.5}>
        <Text color="light.greenText2" letterSpacing={1.12} fontSize={14}>
          {props.title}
        </Text>
        <Text color="light.GreyText" letterSpacing={0.6} fontSize={12}>
          {props.description}
        </Text>
      </Box>
    </Box>
  );
}

export default CountrySwitchCard;
