import React from 'react';
import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';
import ArrowIcon from 'src/assets/images/icon_arrow.svg';
import { hp } from 'src/constants/responsive';

function LanguageNote(props) {
  const { colorMode } = useColorMode();
  return (
    <Box
      backgroundColor={`${colorMode}.primaryBackground`}
      mx={5}
      padding={3}
      height={hp(82)}
      justifyContent="center"
    >
      <Box opacity={1}>
        <Text fontSize={14} color={`${colorMode}.primaryText`} letterSpacing={1.12}>
          {props.title}
        </Text>
      </Box>
      <Box flexDirection="row">
        <Text fontSize={12} width={80} color={`${colorMode}.GreyText`} letterSpacing={0.6}>
          {props.subtitle}
        </Text>
        <ArrowIcon marginTop={5} />
      </Box>
    </Box>
  );
}

export default LanguageNote;
