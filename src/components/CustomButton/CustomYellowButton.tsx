import React from 'react';
import { TouchableHighlight, StyleSheet } from 'react-native';
import { Text } from 'native-base';
import LinearGradient from 'react-native-linear-gradient';

const CustomYellowButton = (props) => {
  return (
    <TouchableHighlight
      style={styles.button}
      disabled={props.disabled}
      underlayColor={'none'}
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
        useAngle={true}
        angle={286}
        angleCenter={{
          x: 1,
          y: 0.0,
        }}
        colors={['#E3BE96', '#E3BE96']}
        style={styles.linearGradient}
      >
        <Text color={'#30292F'} fontSize={12} fontWeight={'300'} fontFamily={'body'}>
          {props.value}
        </Text>
      </LinearGradient>
    </TouchableHighlight>
  );
};

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

export default CustomYellowButton;
