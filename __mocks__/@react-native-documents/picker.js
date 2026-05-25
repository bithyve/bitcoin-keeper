const types = {
  allFiles: '*/*',
};

const errorCodes = {
  OPERATION_CANCELED: 'OPERATION_CANCELED',
};

const pick = jest.fn(() =>
  Promise.resolve([
    {
      uri: 'file:///mocked/document.txt',
      name: 'document.txt',
      type: 'text/plain',
    },
  ])
);

const isErrorWithCode = (error) => Boolean(error && typeof error.code === 'string');

module.exports = {
  errorCodes,
  isErrorWithCode,
  pick,
  types,
};