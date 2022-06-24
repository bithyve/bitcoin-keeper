import React from 'react';
import { Box, Text } from 'native-base';
import { wp } from 'src/common/data/responsiveness/responsive';

type Props = {
  title: string,
  desciption: string,
  width?: number
};

const InfoBox = ({ title, desciption, width = 285 }: Props) => {
  return (
    <Box flexDirection={'column'} marginLeft={5}>
      <Text color={'light.lightBlack'} fontWeight={200} fontFamily={'body'} fontSize={14} letterSpacing={1.12}>
        {title}
      </Text>
      <Text width={wp(width)} color={'light.GreyText'} fontWeight={200} fontFamily={'body'} fontSize={12} letterSpacing={0.6}>
        {desciption}
      </Text>
    </Box>
  );
}

export default InfoBox