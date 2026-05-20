// https://github.com/mrousavy/react-native-mmkv#documentation
import { createMMKV } from 'react-native-mmkv';
import { Storage as ReduxPersisStorate } from 'redux-persist';

type KVStore = {
  set: (key: string, value: string | number | boolean) => void;
  getString: (key: string) => string | undefined;
  getNumber: (key: string) => number | undefined;
  getBoolean: (key: string) => boolean | undefined;
  getAllKeys: () => string[];
  contains: (key: string) => boolean;
  remove: (key: string) => boolean;
  clearAll: () => void;
};

export const Storage: KVStore = (() => {
  try {
    return createMMKV();
  } catch (error) {
    console.log('MMKV unavailable in current runtime, using in-memory fallback:', error);
    throw error;
  }
})();

export const setItem = (key: string, value: string | number | boolean): void =>
  Storage.set(key, value);

export const getString = (key: string): string | undefined => Storage.getString(key);

export const getNumber = (key: string): number => Storage.getNumber(key) ?? 0;

export const getBoolean = (key: string): boolean => Storage.getBoolean(key) ?? false;

export const getEverything = (): string[] => Storage.getAllKeys();

export const hasItem = (key: string): boolean => Storage.contains(key);

export const deleteItem = (key: string): void => {
  Storage.remove(key);
};

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
    Storage.remove(key);
    return Promise.resolve();
  },
};

// encrypt all data with a private key
// Storage.recrypt('hunter2')

// remove encryption
// Storage.recrypt(undefined)
