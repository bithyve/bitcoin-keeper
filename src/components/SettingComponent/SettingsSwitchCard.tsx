import { Box, Text, Pressable } from 'native-base';

import React from 'react';
import Switch from '../../components/Switch/Switch';

function SettingsSwitchCard(props) {
  return (
    <Pressable
      onPress={(value) => props.onSwitchToggle(value)}
      flexDirection="row"
      justifyContent="space-evenly"
      p={3}
      borderRadius={10}
      {...props}
    >
      <Box flex={1}>
        <Text
          color="light.lightBlack"
          fontFamily="body"
          fontSize={14}
          fontWeight={200}
          letterSpacing={1.04}
        >
          {props.title}
        </Text>
        <Text
          color="light.GreyText"
          fontFamily="body"
          fontWeight={200}
          letterSpacing={0.36}
          fontSize={12}
        >
          {props.description}
        </Text>
      </Box>
      <Box justifyContent="center" alignItems="flex-end">
        {props.renderStatus ? (
          props.renderStatus()
        ) : (
          <Switch onValueChange={(value) => props.onSwitchToggle(value)} value={props.value} />
        )}
      </Box>
    </Pressable>
  );
}

export default SettingsSwitchCard;
