const createMockStorage = () => {
  let store = {};
  return {
    setItem: async (key, value) => {
      store[key] = value;
    },
    getItem: async (key) => store[key] || null,
    removeItem: async (key) => {
      delete store[key];
    },
    clear: async () => {
      store = {};
    },
  };
};

export default createMockStorage();
