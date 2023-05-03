import React from 'react';
import { TouchableHighlight, StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';

import LinearGradient from 'src/components/KeeperGradient';

export interface Props {
  value: string;
  onPress?: Function;
  disabled?: boolean;
  titleColor?: string;
}
function CustomYellowButton(props: Props) {
  return (
    <TouchableHighlight
      disabled={props.disabled}
      underlayColor="none"
      onPress={() => {
        props.onPress();
      }}
    >
      <LinearGradient
        start={[1, 0]}
        end={[0, 0]}
        colors={['#E3BE96', '#E3BE96']}
        style={styles.linearGradient}
      >
        <Text color={props.titleColor}>
          {props.value}
        </Text>
      </LinearGradient>
    </TouchableHighlight>
  );
}

const styles = StyleSheet.create({
  linearGradient: {
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderColor: '#725436',
    borderWidth: 0.6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    letterSpacing: 1,
    fontSize: 12
  }
});

export default CustomYellowButton;
