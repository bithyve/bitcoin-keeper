import React from 'react';
import { Box, Text } from 'native-base';

type Props = {
  title: string,
  desciption: string,
  width?: string
};

const InfoBox = ({ title, desciption, width = '70%' }: Props) => {
  return (
    <Box flexDirection={'column'} marginLeft={5}>
      <Text color={'light.lightBlack'} fontWeight={200} fontFamily={'body'} fontSize={14} letterSpacing={1.12}>
        {title}
      </Text>
      <Text width={width} color={'light.GreyText'} fontWeight={200} fontFamily={'body'} fontSize={12} letterSpacing={0.6}>
        {desciption}
      </Text>
    </Box>
  );
}

export default InfoBox