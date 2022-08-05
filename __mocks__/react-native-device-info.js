const getVersion = jest.fn(() => '1.0.0')
const buildNumber = jest.fn(() => '40')


const mock = jest.fn().mockImplementation(() => {
  return {
    getVersion,
    buildNumber
  };
});

export default mock;