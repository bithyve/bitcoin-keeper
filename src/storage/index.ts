// https://github.com/mrousavy/react-native-mmkv#documentation
import { MMKV } from 'react-native-mmkv';
import { Storage as ReduxPersisStorate } from 'redux-persist';

type KVStore = Pick<
  MMKV,
  | 'set'
  | 'getString'
  | 'getNumber'
  | 'getBoolean'
  | 'getAllKeys'
  | 'contains'
  | 'delete'
  | 'clearAll'
>;

const createMemoryStore = (): KVStore => {
  const map = new Map<string, unknown>();
  return {
    set: (key: string, value: any) => {
      map.set(key, value);
    },
    getString: (key: string) => {
      const v = map.get(key);
      return typeof v === 'string' ? v : undefined;
    },
    getNumber: (key: string) => {
      const v = map.get(key);
      return typeof v === 'number' ? v : 0;
    },
    getBoolean: (key: string) => {
      const v = map.get(key);
      return typeof v === 'boolean' ? v : false;
    },
    getAllKeys: () => Array.from(map.keys()),
    contains: (key: string) => map.has(key),
    delete: (key: string) => {
      map.delete(key);
    },
    clearAll: () => {
      map.clear();
    },
  };
};

export const Storage: KVStore = (() => {
  try {
    return new MMKV();
  } catch (error) {
    console.log('MMKV unavailable in current runtime, using in-memory fallback:', error);
    // Be resilient: if MMKV fails for any reason (e.g. debugger),
    // fall back so the app can still boot.
    return createMemoryStore();
  }
})();

export const setItem = (key: string, value: string | number | boolean): void =>
  Storage.set(key, value);

export const getString = (key: string): string | undefined => Storage.getString(key);

export const getNumber = (key: string): number => Storage.getNumber(key);

export const getBoolean = (key: string): boolean => Storage.getBoolean(key);

export const getEverything = (): string[] => Storage.getAllKeys();

export const hasItem = (key: string): boolean => Storage.contains(key);

export const deleteItem = (key: string): void => Storage.delete(key);

export const clearStorage = (): void => Storage.clearAll();

export const reduxStorage: ReduxPersisStorate = {
  setItem: (key, value) => {
    Storage.set(key, value);
    return Promise.resolve(true);
  },
  getItem: (key) => {
    const value = Storage.getString(key);
    return Promise.resolve(value);
  },
  removeItem: (key) => {
    Storage.delete(key);
    return Promise.resolve();
  },
};

// encrypt all data with a private key
// Storage.recrypt('hunter2')

// remove encryption
// Storage.recrypt(undefined)
