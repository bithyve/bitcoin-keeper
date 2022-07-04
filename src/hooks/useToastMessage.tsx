import React, { useCallback } from 'react';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useToast } from 'native-base';
import HexaToastMessages from 'src/components/ToastMessages';

const useToastMessage = () => {
    const Toast = useToast();

    function showToast(title, image){
        Toast.show({
            render: () =>  <HexaToastMessages 
            title={title}
            Image={image}
            /> 
        })
    }

    return {showToast};
};

export default useToastMessage;
