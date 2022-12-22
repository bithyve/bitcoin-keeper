import React from 'react';
import { Box } from 'native-base';
import { wp } from 'src/common/data/responsiveness/responsive';
import Text from 'src/components/KeeperText';

type Props = {
  title: string;
  desciption: string;
  width?: number;
};

function InfoBox({ title, desciption, width = 285 }: Props) {
  return (
    <Box flexDirection="column" marginLeft={5}>
      <Text color="light.primaryText" fontSize={14} letterSpacing={1.12}>
        {title}
      </Text>
      <Text width={wp(width)} color="light.GreyText" fontSize={12} letterSpacing={0.6}>
        {desciption}
      </Text>
    </Box>
  );
}

export default InfoBox;
