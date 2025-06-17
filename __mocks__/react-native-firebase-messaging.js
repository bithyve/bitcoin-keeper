export default {
  hasPermission: jest.fn(() => Promise.resolve(true)),
  requestPermission: jest.fn(() => Promise.resolve(true)),
  getToken: jest.fn(() => Promise.resolve('mock-fcm-token')),
  onMessage: jest.fn(() => jest.fn()), // unsubscribe
  setBackgroundMessageHandler: jest.fn(),
};
