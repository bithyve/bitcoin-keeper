import { ConciergeTag } from 'src/models/enums/ConciergeTag';

export const GO_TO_CONCEIERGE = 'GO_TO_CONCEIERGE';
export const OPEN_CONCEIERGE = 'OPEN_CONCEIERGE';
export const LOAD_CONCIERGE_USER = 'LOAD_CONCIERGE_USER';
export const ADD_TICKET_STATUS_UAI = 'ADD_TICKET_STATUS_UAI';
export const SCHEDULE_ONBOARDING_CALL = 'SCHEDULE_ONBOARDING_CALL';

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

export const loadConciergeUser = () => ({
  type: LOAD_CONCIERGE_USER,
});

export const addTicketStatusUAI = (ticketId, title, body) => ({
  type: ADD_TICKET_STATUS_UAI,
  payload: {
    ticketId,
    title,
    body,
  },
});

export const scheduleOnboardingCall = (onboardEmail: string) => ({
  type: SCHEDULE_ONBOARDING_CALL,
  payload: onboardEmail,
});


export { ConciergeTag };
