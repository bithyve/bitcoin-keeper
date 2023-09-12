import React from 'react';
import { TouchableHighlight, StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';

import LinearGradient from 'src/components/KeeperGradient';
import { useColorMode } from 'native-base';

export interface Props {
  value: string;
  onPress?: Function;
  disabled?: boolean;
  titleColor?: string;
}
function CustomYellowButton(props: Props) {
  const { colorMode } = useColorMode();
  return (
    <TouchableHighlight
      disabled={props.disabled}
      underlayColor="none"
      onPress={() => {
        props.onPress();
      }}
      testID="btn_customYellowButton"
    >
      <LinearGradient
        start={[1, 0]}
        end={[0, 0]}
        colors={colorMode === 'light' ? ['#E3BE96', '#E3BE96'] : ['#212726', '#212726']}
        style={styles.buttonContent}
      >
        <Text color={props.titleColor} style={styles.btnText}>
          {props.value}
        </Text>
      </LinearGradient>
    </TouchableHighlight>
  );
}

const styles = StyleSheet.create({
  buttonContent: {
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
    fontSize: 14,
  },
});

export default CustomYellowButton;
