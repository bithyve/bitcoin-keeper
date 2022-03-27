import { StyleSheet } from 'react-native';
import React from 'react';
import { Button } from 'native-base';
import LinearGradient from 'react-native-linear-gradient';
import { TouchableOpacity } from 'react-native-gesture-handler';

const PrimaryButton = ({ callback, text }) => {
  return (
    <TouchableOpacity onPress={callback}>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        colors={['#00836A', '#073E39']}
        style={{ borderRadius: 10 }}
      >
        <Button
          bgColor={'transparent'}
          _text={{
            minW: 60,
            color: '#FAFAFA',
            fontSize: '14',
            textAlign: 'center',
          }}
        >
          {text}
        </Button>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default PrimaryButton;

const styles = StyleSheet.create({});
