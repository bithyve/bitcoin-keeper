export default {
  readFile: jest.fn(() => Promise.resolve('mocked content')),
  writeFile: jest.fn(() => Promise.resolve()),
  unlink: jest.fn(() => Promise.resolve()),
  exists: jest.fn(() => Promise.resolve(true)),
  mkdir: jest.fn(() => Promise.resolve()),
  DocumentDirectoryPath: '/mocked/document/dir',
  ExternalDirectoryPath: '/mocked/external/dir',
};
