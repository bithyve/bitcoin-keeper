import cryptoJS from 'crypto-js';
import { randomBytes } from 'crypto';
import NodeRSA from 'node-rsa';
import { RSA } from 'react-native-rsa-native';

export const hash256 = (data: string) => cryptoJS.SHA256(data).toString(cryptoJS.enc.Hex);
export const hash512 = (data: string) => cryptoJS.SHA512(data).toString(cryptoJS.enc.Hex);

export const getRandomBytes = (size: number = 32) => randomBytes(size).toString('hex');

export const getKeyAndHash = (size: number) => {
  const encryptionKey = getRandomBytes(size);
  const hash = getHashFromKey(encryptionKey);
  return { encryptionKey, hash };
};

export const getHashFromKey = (encryptionKey: string) => {
  return cryptoJS.SHA256(encryptionKey).toString(cryptoJS.enc.Hex);
};

export const generateEncryptionKey = (entropy?: string, randomBytesSize?: number): string =>
  entropy ? hash256(entropy) : hash256(getRandomBytes(randomBytesSize));

export const encrypt = (key: string, data: string): string =>
  cryptoJS.AES.encrypt(data, key).toString();

export const decrypt = (key: string, encrypted: any): string =>
  cryptoJS.AES.decrypt(encrypted, key).toString(cryptoJS.enc.Utf8);

export const generateRSAKeypair = async () => {
  const keys = await RSA.generateKeys(2048);
  return {
    privateKey: keys.private,
    publicKey: keys.public,
  };
};

export const generateAESKey = (length: number): string => {
  if (![16, 24, 32].includes(length)) {
    throw new Error('Invalid key length. AES supports 128, 192, or 256-bit keys.');
  }
  return randomBytes(length).toString('hex');
};

export const asymmetricDecrypt = (encryptedData: string, privateRSAKey: string) => {
  const key = new NodeRSA(privateRSAKey);
  const decrypted = key.decrypt(encryptedData, 'utf8');
  return decrypted;
};

export const cryptoRandom = () => {
  // replacement for Math.random, provides more secure source of randomness
  const bytes = randomBytes(4); // 4 bytes for a 32-bit integer
  const randomNumber = bytes.readUInt32LE() / 0xffffffff; // Convert to a number between 0 and 1
  return randomNumber;
};

/**
 * Generates a cryptographic key of the specified length.
 * @param {number} length - The length of the key in bytes.
 * @returns {string} - The generated key as a hexadecimal string.
 * @throws {Error} - If the length is invalid or less than 1.
 */
export const generateKey = (length: number): string => {
  if (length < 1) {
    throw new Error('Key length must be greater than 0.');
  }
  return randomBytes(length).toString('hex');
};
