import React from 'react';
import Text from 'src/components/KeeperText';
import { Box } from 'native-base';

function Heading({ title, subTitle, alignItems = 'flex-start' }) {
  return (
    <Box marginY={4} alignItems={alignItems}>
      <Text color="light.primaryText" fontSize={22} fontFamily="body" letterSpacing={1.1}>
        {title}
      </Text>
      <Text
        color="light.primaryText"
        fontSize={13}
        fontFamily="body"
        fontWeight="100"
        letterSpacing={0.65}
      >
        {subTitle}
      </Text>
    </Box>
  );
}

export default Heading;
