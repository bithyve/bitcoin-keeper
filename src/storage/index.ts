// https://github.com/mrousavy/react-native-mmkv#documentation
import { MMKV } from 'react-native-mmkv';
import { Storage as ReduxPersisStorate } from 'redux-persist';

export const Storage = new MMKV();

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
