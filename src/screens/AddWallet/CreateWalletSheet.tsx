import { VStack } from 'native-base';
import React, { Component } from 'react';
import HexaBottomSheet from '../../components/BottomSheet';
import LoadingText from '../../components/LoadingText';

const CreateWalletSheet = ({ createWalletSheetRef, title, processMap }) => {
  return (
    <HexaBottomSheet
      title={title}
      // subTitle={'This may take sometime'}
      snapPoints={['45%']}
      bottomSheetRef={createWalletSheetRef}
    >
      <VStack alignItems="flex-start">
        {processMap.map((process, index) => {
          const timeOut = (index + 1) * 2;
          return <LoadingText key={process.id} text={process.text} timeOut={timeOut} />;
        })}
      </VStack>
    </HexaBottomSheet>
  );
};

export default CreateWalletSheet;
