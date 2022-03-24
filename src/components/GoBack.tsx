import Back from 'src/assets/images/back.svg';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';

const GoBack = () => {
  const navigation = useNavigation();
  const pressableArea = { top: 50, bottom: 50, right: 50, left: 50 };
  return (
    <TouchableOpacity onPress={navigation.goBack} hitSlop={pressableArea}>
      <Back />
    </TouchableOpacity>
  );
};
export default GoBack;
