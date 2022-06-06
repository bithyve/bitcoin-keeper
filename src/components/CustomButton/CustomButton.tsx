import React from 'react';
import { TouchableHighlight, StyleSheet } from 'react-native';
import { Text } from 'native-base';
import LinearGradient from 'react-native-linear-gradient';

const CustomButton = (props: any) => {
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
        colors={['#00836A', '#FFFFFF']}
        style={styles.linearGradient}
      >
        <Text color={'#073E39'} fontSize={12} fontWeight={'bold'}>
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
  btnText: {
    color: '#F4F4F4',
    fontSize: 12,
    fontWeight: 'bold',
  },
  linearGradient: {
    width: 120,
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadowProp: {
    shadowColor: '#073E3926',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 2,
  },
});

export default CustomButton;
