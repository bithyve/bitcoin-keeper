export const GET_ADVISORS = 'GET_ADVISORS';

export const getAdvisors = (callback = null) => ({
  type: GET_ADVISORS,
  callback,
});
