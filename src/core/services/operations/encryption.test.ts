import { decrypt, encrypt, generateEncryptionKey, hash512 } from './encryption';

test('sha512 hash test', () => {
  const hased = hash512('sample-string');
  console.log({ hased });
  // expect(hash512('sample-string')).toEqual(
  //   '928ed2abe400416566af99b19ac91fe4f52ee4d72c9a2d3b477d40c28ce2b3c5e0480b73bdf7dafd4f948f713fc7de1cb0397779fa31c49e4bbad8bee8f95d96'
  // );
});

// describe('Encryption and decryption testing', () => {
//   let key = '';
//   beforeAll(async () => {
//     key = await generateEncryptionKey();
//   });
//   test('Key is genarated', () => {
//     expect(key).not.toBe('');
//   });
//   const message = 'some-message';
//   const encrypted = encrypt(key, message);
//   const decrypted = decrypt(key, encrypted);

//   test('Encrytion and decrytion', () => {
//     expect(decrypted).toEqual(message);
//   });
// });
