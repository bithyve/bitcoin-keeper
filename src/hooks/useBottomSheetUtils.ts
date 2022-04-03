import React, { useCallback } from 'react';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';

const useBottomSheetUtils = (bottomSheetRef: React.MutableRefObject<BottomSheetMethods>) => {
  const closeSheet = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);
  const openSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  return { closeSheet, openSheet };
};

export default useBottomSheetUtils;
