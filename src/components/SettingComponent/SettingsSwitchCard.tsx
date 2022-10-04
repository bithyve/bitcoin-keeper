import { Box, Text } from 'native-base';

import { RFValue } from 'react-native-responsive-fontsize';
import React from 'react';
import Switch from '../../components/Switch/Switch';

const SettingsSwitchCard = (props) => {
  return (
    <Box flexDirection={'row'} justifyContent={'space-evenly'} p={3} borderRadius={10} {...props}>
      <Box flex={0.9}>
        <Text
          color={'light.lightBlack'}
          fontFamily={'body'}
          fontSize={RFValue(14)}
          fontWeight={200}
          letterSpacing={1.04}
        >
          {props.title}
        </Text>
        <Text
          color={'light.GreyText'}
          fontFamily={'body'}
          fontWeight={200}
          letterSpacing={0.36}
          fontSize={RFValue(12)}
        >
          {props.description}
        </Text>
      </Box>
      <Box flex={0.1} justifyContent={'center'} alignItems={'center'}>
        <Switch onValueChange={(value) => props.onSwitchToggle(value)} value={props.value} />
      </Box>
    </Box>
  );
};

export default SettingsSwitchCard;
