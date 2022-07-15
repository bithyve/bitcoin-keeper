import crypto from 'crypto';
import config from '../../config';

const CipherSpec: {
  algorithm: string;
  salt: string;
  iv: Buffer;
  keyLength: number;
} = config.CIPHER_SPEC;

export const hash256 = (data: string) => {
  const hash = crypto.createHash('sha256');
  return hash.update(data).digest('hex');
};

export const hash512 = (data: string) => {
  const hash = crypto.createHash('sha512');
  return hash.update(data).digest('hex');
};

export const generateEncryptionKey = (seed?: string): string => {
  const key = seed ? hash256(seed) : hash256(crypto.randomBytes(32).toString('hex'));
  return key;
};

const sizeKey = (key: string) => key.slice(key.length - CipherSpec.keyLength);

export const encrypt = (key: string, data: string): string => {
  const cipher = crypto.createCipheriv(CipherSpec.algorithm, sizeKey(key), CipherSpec.iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

export const decrypt = (key: string, encrypted: string): string => {
  const decipher = crypto.createDecipheriv(CipherSpec.algorithm, sizeKey(key), CipherSpec.iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

export const stringToArrayBuffer = (byteString: string): Uint8Array => {
  const byteArray = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    byteArray[i] = byteString.codePointAt(i);
  }
  return byteArray;
};
