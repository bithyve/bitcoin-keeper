import React from 'react';
import { Box, Text, useColorMode } from 'native-base';

type Props = {
  title: string;
  subtitle: string;
  subtitleColor?: string;
  width?: string | number
};

const Note = ({ title, subtitle, subtitleColor = 'lightBlack', width = '100%' }: Props) => {
  const { colorMode } = useColorMode();

  return (
    <Box bg={`${colorMode}.offWhite`} mx={5} p={3}>
      <Box opacity={1}>
        <Text fontSize={14} fontFamily={'body'} color={`light.lightBlack`} fontWeight={200}>
          {title}
        </Text>
      </Box>
      <Box>
        <Text fontSize={12} width={width} fontFamily={'body'} color={`light.${subtitleColor}`}>
          {subtitle}
        </Text>
      </Box>
    </Box>
  );
};

export default Note;
