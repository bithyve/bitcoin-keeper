const mock = jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    post: jest.fn(),
    stopIfRunning: jest.fn(),
    startIfNotStarted: jest.fn(async () => 1234)
  }));

export default mock;