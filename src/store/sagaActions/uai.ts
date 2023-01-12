import { UAI, uaiType } from 'src/common/data/models/interfaces/Uai';

export const ADD_TO_UAI_STACK = 'ADD_TO_UAI_STACK';
export const UAI_ACTIONED = 'UAI_ACTIONED';
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

export const uaiActioned = (uaiId: string) => ({
  type: UAI_ACTIONED,
  payload: {
    uaiId,
  },
});

export const uaiChecks = (checkForTypes: uaiType[]) => ({
  type: UAI_CHECKS,
  payload: {
    checkForTypes,
  },
});

export const uaiActionedEntity = (entityId: string, action: boolean = true) => ({
  type: UAI_ACTIONED_ENTITY,
  payload: {
    entityId,
    action,
  },
});
