import { ConciergeTag } from 'src/models/enums/ConciergeTag';

export const GO_TO_CONCEIERGE = 'GO_TO_CONCEIERGE';
export const OPEN_CONCEIERGE = 'OPEN_CONCEIERGE';

export const goToConcierge = (tags: ConciergeTag[], screenName = '') => ({
  type: GO_TO_CONCEIERGE,
  payload: {
    tags,
    screenName,
  },
});

export const openConcierge = (dontShow: boolean) => ({
  type: OPEN_CONCEIERGE,
  payload: {
    dontShow,
  },
});
export { ConciergeTag };
