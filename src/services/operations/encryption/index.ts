import cryptoJS from 'crypto-js';
import { randomBytes } from 'crypto';
import { RSA } from 'react-native-rsa-native';

export const hash256 = (data: string) => cryptoJS.SHA256(data).toString(cryptoJS.enc.Hex);
export const hash512 = (data: string) => cryptoJS.SHA512(data).toString(cryptoJS.enc.Hex);

export const getRandomBytes = (size: number = 32) => randomBytes(size).toString('hex');

export const generateEncryptionKey = (entropy?: string, randomBytesSize?: number): string =>
  entropy ? hash256(entropy) : hash256(getRandomBytes(randomBytesSize));

export const encrypt = (key: string, data: string): string =>
  cryptoJS.AES.encrypt(data, key).toString();

export const decrypt = (key: string, encrypted: any): string =>
  cryptoJS.AES.decrypt(encrypted, key).toString(cryptoJS.enc.Utf8);

export const generateKey = (length: number): string => {
  let result = '';
  const characters = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'; // base-58
  const charactersLength = characters.length;
  for (let itr = 0; itr < length; itr++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const asymmetricEncrypt = (data: string, publicKey: string): Promise<string> => {
  return RSA.encrypt(data, publicKey);
};
