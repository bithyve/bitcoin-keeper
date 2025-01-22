import { uaiType } from 'src/models/interfaces/Uai';

export const ADD_TO_UAI_STACK = 'ADD_TO_UAI_STACK';
export const UAI_ACTIONED = 'UAI_ACTIONED';
export const UAI_CHECKS = 'UAI_CHECKS';
export const UAIS_SEEN = 'UAIS_SEEN';

export const addToUaiStack = (payload: {
  uaiType: uaiType;
  entityId?: string;
  uaiDetails?: {
    heading?: string;
    body?: string;
  };
}) => {
  return {
    type: ADD_TO_UAI_STACK,
    payload,
  };
};

export const uaiActioned = (payload: {
  uaiId?: string;
  action: boolean;
  entityId?: string;
  uaiType?: uaiType;
}) => ({
  type: UAI_ACTIONED,
  payload,
});

export const uaisSeen = (payload: { uaiIds?: string[] }) => {
  return {
    type: UAIS_SEEN,
    payload,
  };
};

export const uaiChecks = (checkForTypes: uaiType[]) => ({
  type: UAI_CHECKS,
  payload: {
    checkForTypes,
  },
});
