const mock = jest.fn().mockImplementation(() => ({
  getConstants: jest.fn(),
}));

export default mock;
