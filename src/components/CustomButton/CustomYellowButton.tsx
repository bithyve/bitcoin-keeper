import React from 'react';
import { TouchableHighlight, StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';

import LinearGradient from 'src/components/KeeperGradient';

export interface Props {
  value: string;
  onPress?: Function;
  disabled?: boolean;
}
function CustomYellowButton(props: Props) {
  return (
    <TouchableHighlight
      style={styles.button}
      disabled={props.disabled}
      underlayColor="none"
      onPress={() => {
        props.onPress();
      }}
      testID='btn_customYellowButton'
    >
      <LinearGradient
        start={[1, 0]}
        end={[0, 0]}
        colors={['#E3BE96', '#E3BE96']}
        style={styles.linearGradient}
      >
        <Text color="#30292F" fontSize={12} bold>
          {props.value}
        </Text>
      </LinearGradient>
    </TouchableHighlight>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 80,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linearGradient: {
    width: 75,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CustomYellowButton;
