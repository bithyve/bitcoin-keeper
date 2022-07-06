import crypto from 'crypto';
import config from '../../config';

const CipherSpec: {
  algorithm: string;
  salt: string;
  iv: Buffer;
  keyLength: number;
} = config.CIPHER_SPEC;

export const generateEncryptionKey = (seed?: string): string => {
  let key = seed ? seed : crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha512');
  key = hash.update(key).digest('hex');
  return key.slice(key.length - CipherSpec.keyLength);
};

export const encrypt = (key: string, dataPacket: any) => {
  const cipher = crypto.createCipheriv(CipherSpec.algorithm, key, CipherSpec.iv);
  dataPacket.validator = config.AUTH_ID;
  let encrypted = cipher.update(JSON.stringify(dataPacket), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    encryptedData: encrypted,
  };
};

export const decrypt = (key: string, encryptedDataPacket: string) => {
  key = key.slice(key.length - CipherSpec.keyLength);
  const decipher = crypto.createDecipheriv(CipherSpec.algorithm, key, CipherSpec.iv);
  let decrypted = decipher.update(encryptedDataPacket, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  const data = JSON.parse(decrypted);
  if (data.validator !== config.AUTH_ID)
    throw new Error('Decryption failed, invalid validator for the following data packet');

  return {
    decryptedData: data,
  };
};
