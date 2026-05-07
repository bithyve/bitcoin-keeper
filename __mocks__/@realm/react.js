const React = require('react');

const createCollection = (items = []) => {
  const collection = [...items];
  collection.filtered = jest.fn(() => collection);
  collection.sorted = jest.fn(() => collection);
  collection.snapshot = jest.fn(() => collection);
  collection.addListener = jest.fn();
  collection.removeListener = jest.fn();
  collection.removeAllListeners = jest.fn();
  return collection;
};

const realmInstance = {
  objects: jest.fn(() => createCollection()),
  objectForPrimaryKey: jest.fn(() => null),
  write: jest.fn((callback) => callback && callback()),
  create: jest.fn(),
  delete: jest.fn(),
  close: jest.fn(),
  isClosed: false,
};

const RealmProvider = ({ children }) => React.createElement(React.Fragment, null, children);

const useRealm = jest.fn(() => realmInstance);
const useQuery = jest.fn(() => createCollection());
const useObject = jest.fn(() => null);

const createRealmContext = jest.fn(() => ({
  RealmProvider,
  useRealm,
  useQuery,
  useObject,
}));

module.exports = {
  RealmProvider,
  createRealmContext,
  useObject,
  useQuery,
  useRealm,
};