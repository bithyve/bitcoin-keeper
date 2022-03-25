import React from 'react';
import { Button } from 'native-base';
import { TouchableOpacity } from 'react-native-gesture-handler';

const SecondaryButton = ({ callback, text }) => {
  return (
    <TouchableOpacity onPress={callback}>
      <Button
        variant="ghost"
        borderRadius={10}
        _text={{
          color: '#073E39',
          fontSize: '14',
        }}
      >
        {text}
      </Button>
    </TouchableOpacity>
  );
};

export default SecondaryButton;
