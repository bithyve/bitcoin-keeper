import { x25519 } from '@noble/curves/ed25519';
import { randomBytes } from 'crypto';
import { createCipheriv, createDecipheriv, createHash } from 'crypto';

/**
 * X25519 Encryption and Decryption utilities
 * Uses Curve25519 for key exchange and AES-256-GCM for symmetric encryption
 */

export interface KeyPair {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
}

export interface EncryptedData {
  ciphertext: Uint8Array;
  nonce: Uint8Array;
  tag: Uint8Array;
  ephemeralPublicKey: Uint8Array;
}

/**
 * Generate a new X25519 key pair
 * @returns Object containing private and public keys
 */
export function generateKeyPair(): KeyPair {
  const privateKey = x25519.utils.randomPrivateKey();
  const publicKey = x25519.getPublicKey(privateKey);

  return {
    privateKey,
    publicKey,
  };
}

/**
 * Derive a shared secret using X25519 key exchange
 * @param privateKey - Your private key
 * @param publicKey - The other party's public key
 * @returns Shared secret as Uint8Array
 */
export function deriveSharedSecret(privateKey: Uint8Array, publicKey: Uint8Array): Uint8Array {
  return x25519.getSharedSecret(privateKey, publicKey);
}

/**
 * Derive an encryption key from shared secret using HKDF-like approach
 * @param sharedSecret - The shared secret from key exchange
 * @param salt - Optional salt (defaults to empty)
 * @param info - Optional context info (defaults to 'encryption')
 * @returns 32-byte encryption key
 */
export function deriveEncryptionKey(
  sharedSecret: Uint8Array,
  salt: Uint8Array = new Uint8Array(0),
  info: string = 'encryption'
): Uint8Array {
  // Simple HKDF-like key derivation using SHA-256
  const hash = createHash('sha256');
  hash.update(sharedSecret);
  hash.update(salt);
  hash.update(Buffer.from(info, 'utf8'));
  return new Uint8Array(hash.digest());
}

/**
 * Encrypt data using AES-256-GCM with the derived key
 * @param data - Data to encrypt
 * @param key - 32-byte encryption key
 * @returns Object containing ciphertext, nonce, and authentication tag
 */
export function encryptWithKey(
  data: Uint8Array,
  key: Uint8Array
): {
  ciphertext: Uint8Array;
  nonce: Uint8Array;
  tag: Uint8Array;
} {
  if (key.length !== 32) {
    throw new Error('Key must be 32 bytes for AES-256');
  }

  const nonce = randomBytes(12); // 96-bit nonce for GCM
  const cipher = createCipheriv('aes-256-gcm', key, nonce);

  const ciphertext = Buffer.concat([cipher.update(data), cipher.final()]);

  const tag = cipher.getAuthTag();

  return {
    ciphertext: new Uint8Array(ciphertext),
    nonce: new Uint8Array(nonce),
    tag: new Uint8Array(tag),
  };
}

/**
 * Decrypt data using AES-256-GCM with the derived key
 * @param ciphertext - Encrypted data
 * @param key - 32-byte encryption key
 * @param nonce - 12-byte nonce
 * @param tag - Authentication tag
 * @returns Decrypted data
 */
export function decryptWithKey(
  ciphertext: Uint8Array,
  key: Uint8Array,
  nonce: Uint8Array,
  tag: Uint8Array
): Uint8Array {
  if (key.length !== 32) {
    throw new Error('Key must be 32 bytes for AES-256');
  }

  if (nonce.length !== 12) {
    throw new Error('Nonce must be 12 bytes for GCM');
  }

  const decipher = createDecipheriv('aes-256-gcm', key, nonce);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

  return new Uint8Array(decrypted);
}

/**
 * Internal encrypt function that works with Uint8Arrays
 * @param data - Data to encrypt
 * @param recipientPublicKey - Recipient's X25519 public key
 * @returns Encrypted data package
 */
function encryptInternal(data: Uint8Array, recipientPublicKey: Uint8Array): EncryptedData {
  // Generate ephemeral key pair
  const ephemeralKeyPair = generateKeyPair();

  // Derive shared secret
  const sharedSecret = deriveSharedSecret(ephemeralKeyPair.privateKey, recipientPublicKey);

  // Derive encryption key
  const encryptionKey = deriveEncryptionKey(sharedSecret);

  // Encrypt the data
  const { ciphertext, nonce, tag } = encryptWithKey(data, encryptionKey);

  return {
    ciphertext,
    nonce,
    tag,
    ephemeralPublicKey: ephemeralKeyPair.publicKey,
  };
}

/**
 * Internal decrypt function that works with Uint8Arrays
 * @param encryptedData - Encrypted data package
 * @param privateKey - Your X25519 private key
 * @returns Decrypted data
 */
function decryptInternal(encryptedData: EncryptedData, privateKey: Uint8Array): Uint8Array {
  const { ciphertext, nonce, tag, ephemeralPublicKey } = encryptedData;

  // Derive shared secret using ephemeral public key and our private key
  const sharedSecret = deriveSharedSecret(privateKey, ephemeralPublicKey);

  // Derive encryption key
  const encryptionKey = deriveEncryptionKey(sharedSecret);

  // Decrypt the data
  return decryptWithKey(ciphertext, encryptionKey, nonce, tag);
}

/**
 * Utility function to convert hex string to Uint8Array
 * @param hex - Hex string
 * @returns Uint8Array
 */
export function hexToUint8Array(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error('Hex string must have even length');
  }

  const array = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    array[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return array;
}

/**
 * Utility function to convert Uint8Array to hex string
 * @param array - Uint8Array
 * @returns Hex string
 */
export function uint8ArrayToHex(array: Uint8Array): string {
  return Array.from(array)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Serialize encrypted data to a hex string for transmission/storage
 * @param encryptedData - Encrypted data package
 * @returns Serialized hex string
 */
export function serializeEncryptedData(encryptedData: EncryptedData): string {
  const { ciphertext, nonce, tag, ephemeralPublicKey } = encryptedData;

  // Format: [ephemeralPublicKey(32) | nonce(12) | tag(16) | ciphertext(variable)]
  const buffer = new Uint8Array(32 + 12 + 16 + ciphertext.length);

  buffer.set(ephemeralPublicKey, 0);
  buffer.set(nonce, 32);
  buffer.set(tag, 44);
  buffer.set(ciphertext, 60);

  return uint8ArrayToHex(buffer);
}

/**
 * Deserialize encrypted data from a hex string
 * @param hex - Serialized encrypted data as hex string
 * @returns Encrypted data package
 */
export function deserializeEncryptedData(hex: string): EncryptedData {
  const buffer = hexToUint8Array(hex);

  if (buffer.length < 60) {
    throw new Error('Invalid encrypted data buffer length');
  }

  return {
    ephemeralPublicKey: buffer.slice(0, 32),
    nonce: buffer.slice(32, 44),
    tag: buffer.slice(44, 60),
    ciphertext: buffer.slice(60),
  };
}

/**
 * Encrypt a string message for a recipient
 * @param message - String message to encrypt
 * @param recipientPublicKey - Recipient's public key as hex string
 * @returns Serialized encrypted data as hex string
 */
export function encryptMessage(message: string, recipientPublicKey: string): string {
  const messageBytes = new TextEncoder().encode(message);
  const recipientPublicKeyBytes = hexToUint8Array(recipientPublicKey);
  const encryptedData = encryptInternal(messageBytes, recipientPublicKeyBytes);
  return serializeEncryptedData(encryptedData);
}

/**
 * Decrypt a string message using your private key
 * @param encryptedHex - Serialized encrypted data as hex string
 * @param privateKey - Your private key as hex string
 * @returns Decrypted string message
 */
export function decryptMessage(encryptedHex: string, privateKey: string): string {
  const encryptedData = deserializeEncryptedData(encryptedHex);
  const decryptedBytes = decryptInternal(encryptedData, hexToUint8Array(privateKey));
  return new TextDecoder().decode(decryptedBytes);
}

/**
 * Generate a key pair with hex string outputs
 * @returns Object containing private and public keys as hex strings
 */
export function generateKeyPairHex(): { privateKey: string; publicKey: string } {
  const keyPair = generateKeyPair();
  return {
    privateKey: uint8ArrayToHex(keyPair.privateKey),
    publicKey: uint8ArrayToHex(keyPair.publicKey),
  };
}
