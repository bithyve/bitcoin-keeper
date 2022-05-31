import { uaiType } from 'src/common/data/models/interfaces/Uai';
import { v4 as uuidv4 } from 'uuid';
export const ADD_TO_UAI_STACK = 'ADD_TO_STACK';

export const addToUaiStack = (
  title: string,
  isActioned: boolean,
  uaiType: uaiType,
  prirority: number
) => {
  const uai = {
    id: uuidv4(),
    title,
    isActioned,
    timeStamp: new Date(),
    uaiType,
    prirority,
  };
  console.log('asdf');

  return {
    type: ADD_TO_UAI_STACK,
    payload: {
      uai,
    },
  };
};
