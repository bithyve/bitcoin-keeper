import Text from 'src/components/KeeperText';
import { Box, Pressable } from 'native-base';

import LinkIcon from 'src/assets/images/link.svg';
import React from 'react';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';

function SettingsCard(props) {
  const iff = (condition, then, otherwise) => (condition ? then : otherwise);
  return (
    <Pressable onPress={() => props.onPress()}>
      <Box
        flexDirection="row"
        justifyContent="space-between"
        padding={3}
        borderRadius={10}
        {...props}
        testID={`view_${props.title.replace(/ /g, '_')}`}
      >
        <Box flex={0.7}>
          <Text color="#041513" fontSize={14} letterSpacing={1.04} testID={`text_${props.title.replace(/ /g, '_')}`}>
            {props.title}
          </Text>
          <Text color="light.GreyText" letterSpacing={0.36} fontSize={12}>
            {props.description}
          </Text>
        </Box>
        <Box flex={0.3} justifyContent="center" alignItems="flex-end">
          {props.renderStatus ? (
            iff(props.renderStatus, props.icon, <LinkIcon />)
          ) : (
            <RightArrowIcon />
          )}
        </Box>
      </Box>
    </Pressable>
  );
}

export default SettingsCard;
