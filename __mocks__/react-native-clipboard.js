export default {
  getString: jest.fn(() => Promise.resolve('mocked clipboard text')),
  setString: jest.fn(),
};
