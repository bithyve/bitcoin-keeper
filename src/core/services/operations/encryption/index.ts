import cryptoJS from 'crypto-js';
import crypto from 'crypto';

export const hash256 = (data: string) => cryptoJS.SHA256(data).toString(cryptoJS.enc.Hex);
export const hash512 = (data: string) => cryptoJS.SHA512(data).toString(cryptoJS.enc.Hex);

export const getRandomBytes = (size: number = 32) => crypto.randomBytes(size).toString('hex');
export const generateEncryptionKey = (seed?: string): string =>
  seed ? hash256(seed) : hash256(getRandomBytes());

export const encrypt = (key: string, data: string): string =>
  cryptoJS.AES.encrypt(data, key).toString();

export const decrypt = (key: string, encrypted: string): string =>
  cryptoJS.AES.decrypt(encrypted, key).toString(cryptoJS.enc.Utf8);
