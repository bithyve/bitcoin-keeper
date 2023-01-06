import {
  hash256,
  hash512,
  generateEncryptionKey,
  encrypt,
  decrypt,
} from '../src/core/services/operations/encryption/index';

describe('Testing cryptographic primitives', () => {
  test('hashing::sha256', () => {
    const hashed = hash256('sample-message');
    expect(hashed).toEqual('94cda233d1fc9c6d0dd3f375c8518e284ddbce939e7f59b6a681864011b13bd4');
  });

  test('hashing::sha512', () => {
    const hashed = hash512('sample-message');
    expect(hashed).toEqual(
      'd5ba4810e227fb65c4fbcd6f8428b1ad6714e6f78481f1680ef275beb4bb7a11382e84c88c3c6421c26db721095979323f364d8a4303f8099937fd9d768b1681'
    );
  });

  let key = '';
  beforeAll(() => {
    const seed = 'sample-seed';
    key = generateEncryptionKey(seed);
  });

  test('key generation', () => {
    expect(key.length).toBe(64);
    expect(key).toBe('895a086afeff7aa154295bc31965fc133e727682dd886de01138d153d2b27aae');
  });

  let encrypted;
  const message = 'sample-message';
  test('Encryption::AES', () => {
    encrypted = encrypt(key, message);
    expect(encrypted).not.toBeUndefined();
  });

  test('Decryption::AES', () => {
    const decrypted = decrypt(key, encrypted);
    expect(decrypted).toBe(message);
  });
});
