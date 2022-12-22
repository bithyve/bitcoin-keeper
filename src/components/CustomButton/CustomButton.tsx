import { ActivityIndicator, StyleSheet, TouchableHighlight } from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import React from 'react';
import Text from 'src/components/KeeperText';

export interface Props {
  value: string;
  onPress?: Function;
  disabled?: boolean;
  testID?: string;
  loading?: boolean;
}
function CustomButton({ value, onPress, disabled, testID, loading = false }: Props) {
  if (loading) {
    return <ActivityIndicator />;
  }
  return (
    <TouchableHighlight
      style={styles.button}
      disabled={disabled}
      underlayColor="none"
      testID={testID || 'customButton'}
      onPress={() => {
        onPress();
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
          x: 1,
          y: 0.0,
        }}
        colors={['#00836A', '#FFFFFF']}
        style={styles.linearGradient}
      >
        <Text color="#073E39" fontSize={12} bold fontFamily="body">
          {value}
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

export default CustomButton;
