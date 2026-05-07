const createStore = () => {
  const values = new Map();

  return {
    set: (key, value) => {
      values.set(key, value);
    },
    getString: (key) => {
      const value = values.get(key);
      return typeof value === 'string' ? value : undefined;
    },
    getNumber: (key) => {
      const value = values.get(key);
      return typeof value === 'number' ? value : undefined;
    },
    getBoolean: (key) => {
      const value = values.get(key);
      return typeof value === 'boolean' ? value : undefined;
    },
    getAllKeys: () => Array.from(values.keys()),
    contains: (key) => values.has(key),
    remove: (key) => values.delete(key),
    clearAll: () => {
      values.clear();
    },
  };
};

class MMKV {
  constructor() {
    return createStore();
  }
}

module.exports = {
  MMKV,
  createMMKV: jest.fn(() => createStore()),
};