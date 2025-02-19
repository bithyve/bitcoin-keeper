import { ConciergeTag } from 'src/models/enums/ConciergeTag';

export const LOAD_CONCIERGE_USER = 'LOAD_CONCIERGE_USER';
export const ADD_TICKET_STATUS_UAI = 'ADD_TICKET_STATUS_UAI';
export const SCHEDULE_ONBOARDING_CALL = 'SCHEDULE_ONBOARDING_CALL';


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
