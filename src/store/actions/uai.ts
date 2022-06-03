import { UAI, uaiType } from 'src/common/data/models/interfaces/Uai';
import { v4 as uuidv4 } from 'uuid';
export const ADD_TO_UAI_STACK = 'ADD_TO_UAI_STACK';
export const UPADTE_UAI_STACK = 'UPADTE_UAI_STACK';

export const addToUaiStack = (
  title: string,
  isDisplay: boolean,
  uaiType: uaiType,
  prirority: number,
  displayText: string | null
) => {
  const uai = {
    id: uuidv4(),
    title,
    isActioned: false,
    isDisplay,
    displayText,
    displayCount: 0,
    timeStamp: new Date(),
    uaiType,
    prirority,
  };

  return {
    type: ADD_TO_UAI_STACK,
    payload: {
      uai,
    },
  };
};

export const updateUaiStack = (uai: UAI) => {
  return {
    type: UPADTE_UAI_STACK,
    payload: {
      uai,
    },
  };
};
