import Text from 'src/components/KeeperText';
import { Box, Pressable, useColorMode } from 'native-base';
import { ActivityIndicator } from 'react-native';

import React from 'react';
import Switch from '../../components/Switch/Switch';


function SettingsSwitchCard(props) {
  const { colorMode } = useColorMode();
  return (
    <Pressable
      onPress={(value) => props.onSwitchToggle(value)}
      flexDirection="row"
      justifyContent="space-evenly"
      padding={3}
      borderRadius={10}
      {...props}
      testID={`btn_${props.title}`}
      disabled={props.disabled}
    // backgroundColor={`${colorMode}.seashellWhite`}
    >
      <Box flex={1}>
        <Text
          color={`${colorMode}.primaryText`}
          fontSize={14}
          letterSpacing={1.04}
          testID={`text_${props.title}`}
        >
          {props.title}
        </Text>
        <Text
          color={`${colorMode}.GreyText`}
          letterSpacing={0.36}
          fontSize={12}
          testID={`text_${props.description}`}
        >
          {props.description}
        </Text>
      </Box>
      <Box justifyContent="center" alignItems="flex-end" testID={`view_${props.title}`}>
        {props.renderStatus ? (
          props.renderStatus()
        ) : props.loading ? (
          <ActivityIndicator />
        ) : (
          <Switch
            onValueChange={(value) => props.onSwitchToggle(value)}
            value={props.value}
            loading={props.loading}
          />
        )}
      </Box>
    </Pressable>
  );
}

export default SettingsSwitchCard;
