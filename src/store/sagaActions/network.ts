export const CONNECT_TO_NODE = 'CONNECT_TO_NODE';
export const SET_AUTOMATIC_CLOUD_BACKUP = 'SET_AUTOMATIC_CLOUD_BACKUP';

export const connectToNode = () => ({
  type: CONNECT_TO_NODE,
});

export const setAutomaticCloudBackup = (payload) => ({
  type: SET_AUTOMATIC_CLOUD_BACKUP,
  payload,
});