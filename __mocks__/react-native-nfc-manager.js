export default {
  isSupported: jest.fn(() => Promise.resolve(true)),
  start: jest.fn(),
  stop: jest.fn(),
  getTag: jest.fn(),
  setEventListener: jest.fn(),
};
