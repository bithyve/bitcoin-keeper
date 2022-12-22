import React from 'react';
import { TouchableHighlight, StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';

import LinearGradient from 'react-native-linear-gradient';

export interface Props {
  value: string;
  onPress?: Function;
  disabled?: boolean;
}
function CustomGreenButton(props: Props) {
  return (
    <TouchableHighlight
      style={styles.button}
      underlayColor="none"
      disabled={props.disabled}
      onPress={() => {
        props.onPress();
      }}
    >
      <LinearGradient
        start={{
          x: 1,
          y: 0,
        }}
        end={{
          x: 0,
          y: 0,
        }}
        useAngle
        angle={286}
        angleCenter={{
          x: 0.5,
          y: 0.0,
        }}
        colors={['#073E39', '#00836A']}
        style={styles.linearGradient}
      >
        <Text color="#FAFAFA" fontSize={13} bold letterSpacing={0.78} fontFamily="body">
          {props.value}
        </Text>
      </LinearGradient>
    </TouchableHighlight>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 120,
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linearGradient: {
    width: 120,
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CustomGreenButton;
