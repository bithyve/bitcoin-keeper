export const widthPercentageToDP = jest.fn(width => width);
export const heightPercentageToDP = jest.fn(height => height);

const mock = jest.fn().mockImplementation(() => ({
    widthPercentageToDP,
    heightPercentageToDP
  }));

export default mock;