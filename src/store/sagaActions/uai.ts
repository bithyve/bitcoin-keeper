import { UAI, uaiType } from 'src/common/data/models/interfaces/Uai';

export const ADD_TO_UAI_STACK = 'ADD_TO_UAI_STACK';
export const UPADTE_UAI_STACK = 'UPADTE_UAI_STACK';
export const UAI_CHECKS = 'UAI_CHECKS';
export const UAI_ACTIONED_ENTITY = 'UAI_ACTIONED_ENTITY';

export const addToUaiStack = (payload: {
  title: string;
  isDisplay: boolean;
  uaiType: uaiType;
  prirority: number;
  displayText?: string;
  entityId?: string;
}) => {
  return {
    type: ADD_TO_UAI_STACK,
    payload,
  };
};

export const updateUaiStack = (uai: UAI) => ({
  type: UPADTE_UAI_STACK,
  payload: {
    uai,
  },
});

export const uaiChecks = (isFirstLogin: boolean = false) => ({
  type: UAI_CHECKS,
  payload: {
    isFirstLogin,
  },
});

export const uaiActionedEntity = (entityId: string, action: boolean = true) => ({
  type: UAI_ACTIONED_ENTITY,
  payload: {
    entityId,
    action,
  },
});
