export const RFValue = jest.fn((value, ) => value);

const mock = jest.fn().mockImplementation(() => ({
    RFValue,
  }));

export default mock;