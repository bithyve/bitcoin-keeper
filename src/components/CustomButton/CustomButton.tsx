import { ActivityIndicator, StyleSheet, TouchableHighlight } from 'react-native';

import LinearGradient from 'src/components/KeeperGradient';
import React from 'react';
import Text from 'src/components/KeeperText';
import { Box } from 'native-base';

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
      {/* <LinearGradient
        start={[1, 0]}
        end={[0, 0]}
        colors={['#80A8A1', '#FFFFFF']}
        
      > */}
      <Box style={styles.linearGradient} backgroundColor='light.white'>
        <Text color="light.greenText" fontSize={12} bold>
          {value}
        </Text>
      </Box>
      {/* </LinearGradient> */}
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
