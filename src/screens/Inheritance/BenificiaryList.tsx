import React from 'react';
import { VStack } from 'native-base';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';

const BenificiaryList = () => {
  return (
    <VStack flex={1}>
      <BottomSheetTextInput
        placeholder="Name"
        placeholderTextColor={'#D8DBD5'}
        selectionColor={'#073E39'}
        style={{
          height: 45,
          backgroundColor: '#fdf6f0',
          color: '#073E39',
          borderRadius: 10,
          paddingHorizontal: 10,
          marginTop: 30,
        }}
      />
      <BottomSheetTextInput
        placeholder="Email"
        placeholderTextColor={'#D8DBD5'}
        selectionColor={'#073E39'}
        style={{
          height: 45,
          backgroundColor: '#fdf6f0',
          color: '#073E39',
          borderRadius: 10,
          paddingHorizontal: 10,
          marginTop: 30,
        }}
      />
      <BottomSheetTextInput
        placeholder="Address"
        placeholderTextColor={'#D8DBD5'}
        selectionColor={'#073E39'}
        style={{
          height: 45,
          backgroundColor: '#fdf6f0',
          color: '#073E39',
          borderRadius: 10,
          paddingHorizontal: 10,
          marginTop: 30,
        }}
      />
    </VStack>
  );
};

export default BenificiaryList;
