import CryptoJS from 'crypto-js';
import { encode as base64Encode, decode as base64Decode } from '@stablelib/base64';
import { x25519, ed25519 } from '@noble/curves/ed25519';

export interface KeyPair {
  publicKey: string; // hex format
  secretKey: string; // hex format (64 bytes: private + public)
}

export interface SessionKeys {
  aesKey: string; // hex format
}

export interface EncryptedKeys {
  encryptedKeys: string; // base64 encrypted session keys
  iv: string; // hex format
}

export interface EncryptedMessage {
  ciphertext: string; // base64 format
  iv: string; // hex format
}

export class ChatEncryptionManagerError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'ChatEncryptionManagerError';
  }
}

export class KeyExchangeError extends ChatEncryptionManagerError {
  constructor(message: string) {
    super(message, 'KEY_EXCHANGE_ERROR');
    this.name = 'KeyExchangeError';
  }
}

export class EncryptionError extends ChatEncryptionManagerError {
  constructor(message: string) {
    super(message, 'ENCRYPTION_ERROR');
    this.name = 'EncryptionError';
  }
}

export class DecryptionError extends ChatEncryptionManagerError {
  constructor(message: string) {
    super(message, 'DECRYPTION_ERROR');
    this.name = 'DecryptionError';
  }
}
export class ChatEncryptionManager {
  /**
   * Perform key exchange with peer's public key (hex format)
   * @param keyPair - Your Ed25519 keypair in hex format
   * @param peerPublicKeyHex - Peer's 32-byte public key in hex format
   * @returns Base64 encoded shared secret
   * @throws {KeyExchangeError} If key exchange fails
   */
  static performKeyExchange(keyPair: KeyPair, peerPublicKeyHex: string): string {
    try {
      const publicKey = ChatEncryptionManager.hexToUint8Array(keyPair.publicKey);
      const privateKeyHex =
        keyPair.secretKey.length === 128 ? keyPair.secretKey.slice(0, 64) : keyPair.secretKey;
      const privateKey = ChatEncryptionManager.hexToUint8Array(privateKeyHex);

      if (publicKey.length !== 32 || privateKey.length !== 32) {
        throw new KeyExchangeError('Invalid key lengths: expected 32 bytes each');
      }

      const peerPublicKey = ChatEncryptionManager.hexToUint8Array(peerPublicKeyHex);
      if (peerPublicKey.length !== 32) {
        throw new KeyExchangeError(`Invalid peer key length: ${peerPublicKey.length}, expected 32`);
      }

      // Create commutative shared secret
      const myPubHex = ChatEncryptionManager.uint8ArrayToHex(publicKey);
      const peerPubHex = ChatEncryptionManager.uint8ArrayToHex(peerPublicKey);
      const sortedKeys = [myPubHex, peerPubHex].sort();
      const combined = 'hyperswarm_shared_secret:' + sortedKeys[0] + sortedKeys[1];

      const hash = CryptoJS.SHA256(combined);
      const sharedSecret = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        sharedSecret[i] = (hash.words[Math.floor(i / 4)] >>> (24 - (i % 4) * 8)) & 0xff;
      }

      const secretHex = ChatEncryptionManager.uint8ArrayToHex(sharedSecret);
      const info = 'ChatEncryptionManager-KeyExchange-v1';
      const derivedKey = CryptoJS.SHA256(secretHex + info);

      const finalKey = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        finalKey[i] = (derivedKey.words[Math.floor(i / 4)] >>> (24 - (i % 4) * 8)) & 0xff;
      }

      return base64Encode(finalKey);
    } catch (error) {
      throw new KeyExchangeError(
        `Key exchange failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  static deriveSharedSecret(
    privateKey: string | Uint8Array,
    publicKey: string | Uint8Array
  ): string {
    const sharedSecret = x25519.getSharedSecret(privateKey.slice(0, 64), publicKey.slice(0, 64));
    return this.uint8ArrayToHex(sharedSecret);
  }

  /**
   * Generate session keys for encryption
   * @returns Object containing hex-encoded AES key
   */
  static generateSessionKeys(): SessionKeys {
    const aesKey = CryptoJS.lib.WordArray.random(32); // 256-bit
    return {
      aesKey: aesKey.toString(),
    };
  }

  /**
   * Encrypt session keys for transmission
   * @param aesKeyHex - Hex-encoded AES key to encrypt
   * @param sharedSecretB64 - Base64 encoded shared secret from key exchange
   * @returns Encrypted keys with IV
   * @throws {EncryptionError} If encryption fails
   */
  static encryptKeys(aesKeyHex: string, sharedSecretB64: string): EncryptedKeys {
    try {
      const sharedSecret = CryptoJS.lib.WordArray.create(base64Decode(sharedSecretB64));
      const keysData = JSON.stringify({
        aesKey: aesKeyHex,
      });

      const iv = CryptoJS.lib.WordArray.random(16);
      const encrypted = CryptoJS.AES.encrypt(keysData, sharedSecret, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      return { encryptedKeys: encrypted.toString(), iv: iv.toString() };
    } catch (error) {
      throw new EncryptionError(
        `Key encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Decrypt received session keys
   * @param encryptedKeyData - Encrypted keys data with IV
   * @param sharedSecretB64 - Base64 encoded shared secret
   * @returns Decrypted session keys
   * @throws {DecryptionError} If decryption fails
   */
  static decryptKeys(encryptedKeyData: EncryptedKeys, sharedSecretB64: string): SessionKeys {
    try {
      const sharedSecret = CryptoJS.lib.WordArray.create(base64Decode(sharedSecretB64));
      const decrypted = CryptoJS.AES.decrypt(encryptedKeyData.encryptedKeys, sharedSecret, {
        iv: CryptoJS.enc.Hex.parse(encryptedKeyData.iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      const keysData: SessionKeys = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));

      return keysData;
    } catch (error) {
      throw new DecryptionError(
        `Key decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Encrypt message with AES only (no authentication)
   * @param message - Plain text message to encrypt
   * @param aesKeyHex - Hex-encoded AES key for this chat thread
   * @returns Encrypted message
   * @throws {EncryptionError} If encryption fails
   */
  static encryptMessage(message: string, aesKeyHex: string): EncryptedMessage {
    try {
      const aesKey = CryptoJS.enc.Hex.parse(aesKeyHex);
      const iv = CryptoJS.lib.WordArray.random(16);
      const encrypted = CryptoJS.AES.encrypt(message, aesKey, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      const ciphertext = encrypted.toString();
      const ivHex = iv.toString();

      return { ciphertext, iv: ivHex };
    } catch (error) {
      throw new EncryptionError(
        `Message encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Decrypt message with AES only (no authentication verification)
   * @param encryptedData - Encrypted message data
   * @param aesKeyHex - Hex-encoded AES key for this chat thread
   * @returns Decrypted plain text message
   * @throws {DecryptionError} If decryption fails
   */
  static decryptMessage(encryptedData: EncryptedMessage, aesKeyHex: string): string {
    try {
      const aesKey = CryptoJS.enc.Hex.parse(aesKeyHex);
      const decrypted = CryptoJS.AES.decrypt(encryptedData.ciphertext, aesKey, {
        iv: CryptoJS.enc.Hex.parse(encryptedData.iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      const result = decrypted.toString(CryptoJS.enc.Utf8);
      if (!result) {
        throw new DecryptionError('Decryption failed - invalid key or corrupted data');
      }
      return result;
    } catch (error) {
      if (error instanceof DecryptionError) throw error;
      throw new DecryptionError(
        `Message decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get public key in hex format from a keypair
   * @param keyPair - Ed25519 keypair
   * @returns Hex encoded public key
   */
  static getPublicKeyHex(keyPair: KeyPair): string {
    return keyPair.publicKey;
  }

  /**
   * Convert hex string to Uint8Array
   * @private
   */
  private static hexToUint8Array(hex: string): Uint8Array {
    if (hex.length % 2 !== 0) {
      throw new Error('Invalid hex string length');
    }
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }

  /**
   * Convert Uint8Array to hex string
   * @private
   */
  private static uint8ArrayToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
}
