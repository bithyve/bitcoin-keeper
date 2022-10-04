export const RFValue = jest.fn((value, ) => value);

const mock = jest.fn().mockImplementation(() => {
  return {
    RFValue,
  };
});

export default mock;