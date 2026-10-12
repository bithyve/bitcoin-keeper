import BIP32Factory from 'bip32';
import * as bitcoin from 'bitcoinjs-lib';
import { Buffer } from 'buffer';
import { NetworkType } from '../enums';
import { RECOVERABLE_MOBILE_KEY_SIGNER_PATH } from '../operations/recoverable/mobileKeyConstants';
import ecc from '../operations/taproot-utils/noble_ecc';
import {
  buildRecoverablePolicyReview,
  type RecoverableMobileSigner,
  type RecoverablePolicyDraftInput,
} from './policyDraft';

const bip32 = BIP32Factory(ecc);
const KDF_ITERATIONS = 600_000;
const MAX_ENVELOPE_BYTES = 4096;

/**
 * Disconnected CLIENT-ONLY foundation, not a native/cloud backup implementation.
 * Only local fixtures may inject cryptography/transport. An omitted adapter
 * fails closed: there is no RN crypto, Keychain, Drive, iCloud or server fallback.
 * No wallet creation, secret import, seed read or signing API is called here.
 */
export interface PreviewBackupFixtureCrypto {
  kind: 'local-fixture-crypto' | 'unavailable';
  randomBytes(length: number): Promise<Uint8Array>;
  /** PBKDF2-HMAC-SHA256, fixed iterations, exactly 32 output bytes. */
  deriveKey(secret: Uint8Array, salt: Uint8Array, iterations: number): Promise<Uint8Array>;
  /** AES-256-GCM, 12-byte nonce, 16-byte authentication tag; authenticate all AAD. */
  encrypt(
    key: Uint8Array,
    nonce: Uint8Array,
    plaintext: Uint8Array,
    aad: Uint8Array
  ): Promise<{ ciphertext: Uint8Array; tag: Uint8Array }>;
  /** Return plaintext only AFTER GCM authentication succeeds. */
  decrypt(
    key: Uint8Array,
    nonce: Uint8Array,
    ciphertext: Uint8Array,
    tag: Uint8Array,
    aad: Uint8Array
  ): Promise<Uint8Array>;
}

export interface PreviewBackupFixtureContext {
  scope: 'recoverable-preview-local-fixture';
  network: NetworkType.TESTNET;
  /** Independently held public references, never passwords or access tokens. */
  backupId: string;
  credentialId: string;
}

export interface PreviewBackupExpectation {
  /** Trusted policy held independently of the encrypted record/transport. */
  policy: RecoverablePolicyDraftInput;
  context: PreviewBackupFixtureContext;
  /** Exactly 32 independently generated high-entropy bytes; not the Mobile seed. */
  recoverySecret: Uint8Array;
}

interface BackupHeader extends PreviewBackupFixtureContext {
  version: 1;
  purpose: 'preview-mobile-key-local-backup';
  policyDigest: string;
  mobileIdentityDigest: string;
  kdf: { algorithm: 'pbkdf2-hmac-sha256'; iterations: 600000; saltHex: string };
  cipher: { algorithm: 'aes-256-gcm'; nonceHex: string; tagBytes: 16 };
}

interface BackupEnvelope {
  header: BackupHeader;
  ciphertextHex: string;
  tagHex: string;
}

export interface PreviewBackupFixtureEvidence {
  kind: 'local-fixture-mobile-key-backup-verified';
  network: NetworkType.TESTNET;
  backupId: string;
  policyDigest: string;
  mobileIdentityDigest: string;
  authenticatedEncryptionVerified: true;
  exactMobileIdentityMatched: true;
  /** A write acknowledgement alone never produces readback evidence. */
  exactFixtureReadbackVerified: boolean;
  cloudBackupVerified: false;
  nativeRestoreVerified: false;
  walletReady: false;
}

export interface PreviewBackupFixtureTransport {
  kind: 'local-fixture';
  write(backupId: string, encryptedEnvelope: string): Promise<void>;
  read(backupId: string): Promise<string | null>;
}

export class PreviewMobileKeyBackupError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = 'PreviewMobileKeyBackupError';
  }
}

function fail(code: string, message: string): never {
  throw new PreviewMobileKeyBackupError(code, message);
}

function unavailable(): never {
  return fail('NATIVE_BACKUP_UNAVAILABLE', 'Native preview backup crypto is not implemented');
}

export const UNAVAILABLE_PREVIEW_BACKUP_CRYPTO: PreviewBackupFixtureCrypto = {
  kind: 'unavailable',
  randomBytes: async () => unavailable(),
  deriveKey: async () => unavailable(),
  encrypt: async () => unavailable(),
  decrypt: async () => unavailable(),
};

function requireFixtureCrypto(crypto: PreviewBackupFixtureCrypto): void {
  if (
    crypto?.kind !== 'local-fixture-crypto' ||
    ['randomBytes', 'deriveKey', 'encrypt', 'decrypt'].some(
      (name) => typeof crypto[name] !== 'function'
    )
  )
    unavailable();
}

function exactKeys(value: unknown, keys: string[]): void {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    ![Object.prototype, null].includes(Object.getPrototypeOf(value)) ||
    Object.keys(value).length !== keys.length ||
    keys.some((key) => !Object.prototype.hasOwnProperty.call(value, key))
  )
    fail('INVALID_BACKUP_FORMAT', 'Invalid preview backup record shape');
}

function validateContext(context: PreviewBackupFixtureContext): PreviewBackupFixtureContext {
  exactKeys(context, ['scope', 'network', 'backupId', 'credentialId']);
  if (
    context.scope !== 'recoverable-preview-local-fixture' ||
    context.network !== NetworkType.TESTNET
  ) {
    fail('TESTNET_FIXTURE_ONLY', 'Backup fixtures require the isolated testnet preview scope');
  }
  for (const value of [context.backupId, context.credentialId]) {
    if (typeof value !== 'string' || !/^[a-zA-Z0-9._:-]{1,128}$/.test(value)) {
      fail('INVALID_BACKUP_CONTEXT', 'Backup context requires bounded public references');
    }
  }
  return {
    scope: 'recoverable-preview-local-fixture',
    network: NetworkType.TESTNET,
    backupId: context.backupId,
    credentialId: context.credentialId,
  };
}

function digest(value: unknown): string {
  return Buffer.from(bitcoin.crypto.sha256(Buffer.from(JSON.stringify(value), 'utf8'))).toString(
    'hex'
  );
}

function mobileIdentity(signer: RecoverableMobileSigner): string {
  return digest([
    signer.role,
    signer.signerType,
    signer.masterFingerprint,
    signer.derivationPath,
    signer.xpub,
  ]);
}

function expectedBinding(expected: PreviewBackupExpectation) {
  const context = validateContext(expected?.context);
  // Delayed inheritance remains blocked until its script, hardware and recovery
  // behavior are independently validated. Never silently back up only its base.
  if (expected.policy?.inheritance !== undefined && expected.policy.inheritance !== null) {
    fail('INHERITANCE_BACKUP_UNVERIFIED', 'Inheritance backup is not validated');
  }
  const review = buildRecoverablePolicyReview(expected.policy);
  const mobile = review.base.signers[0];
  if (mobile.origin.kind !== 'device-generated') {
    fail('UNSUPPORTED_MOBILE_ORIGIN', 'Fixtures require a device-generated Mobile Key policy');
  }
  return {
    context,
    mobile,
    policyDigest: digest({
      version: review.version,
      network: review.network,
      required: review.base.required,
      total: review.base.total,
      signers: review.base.signers,
      inheritance: null,
    }),
    mobileIdentityDigest: mobileIdentity(mobile),
  };
}

function copy32(value: Uint8Array, code: string): Buffer {
  if (!(value instanceof Uint8Array) || value.length !== 32) {
    fail(code, 'Expected exactly 32 bytes of secret material');
  }
  return Buffer.from(value);
}

/** Adapter-returned secret bytes are owned here and cleared in finally. */
function take32(value: Uint8Array, code: string): Buffer {
  if (!(value instanceof Uint8Array) || value.length !== 32) {
    value?.fill?.(0);
    fail(code, 'Expected exactly 32 bytes of secret material');
  }
  return Buffer.from(value.buffer, value.byteOffset, value.byteLength);
}

async function freshBytes(crypto: PreviewBackupFixtureCrypto, length: number): Promise<Buffer> {
  const value = await crypto.randomBytes(length);
  if (!(value instanceof Uint8Array) || value.length !== length) {
    fail('INVALID_RANDOMNESS', 'Invalid cryptographic random byte result');
  }
  return Buffer.from(value);
}

function assertSeedIdentity(seed: Buffer, mobile: RecoverableMobileSigner): void {
  const root = bip32.fromSeed(seed, bitcoin.networks.testnet);
  if (
    Buffer.from(root.fingerprint).toString('hex').toUpperCase() !== mobile.masterFingerprint ||
    root.derivePath(RECOVERABLE_MOBILE_KEY_SIGNER_PATH).neutered().toBase58() !== mobile.xpub ||
    mobile.derivationPath !== RECOVERABLE_MOBILE_KEY_SIGNER_PATH
  )
    fail(
      'MOBILE_IDENTITY_MISMATCH',
      'Recovered key does not match the independently held Mobile policy'
    );
}

function hexBytes(value: unknown, length: number): Buffer {
  if (typeof value !== 'string' || !new RegExp(`^[0-9a-f]{${length * 2}}$`).test(value)) {
    fail('INVALID_BACKUP_FORMAT', 'Invalid preview backup byte encoding or length');
  }
  return Buffer.from(value, 'hex');
}

function parseEnvelope(serialized: string): BackupEnvelope {
  if (
    typeof serialized !== 'string' ||
    Buffer.byteLength(serialized, 'utf8') > MAX_ENVELOPE_BYTES
  ) {
    fail('INVALID_BACKUP_FORMAT', 'Preview backup exceeds the supported record bound');
  }
  let envelope: BackupEnvelope;
  try {
    envelope = JSON.parse(serialized);
  } catch {
    return fail('INVALID_BACKUP_FORMAT', 'Invalid preview backup JSON');
  }
  exactKeys(envelope, ['header', 'ciphertextHex', 'tagHex']);
  const { header } = envelope;
  exactKeys(header, [
    'scope',
    'network',
    'backupId',
    'credentialId',
    'version',
    'purpose',
    'policyDigest',
    'mobileIdentityDigest',
    'kdf',
    'cipher',
  ]);
  exactKeys(header.kdf, ['algorithm', 'iterations', 'saltHex']);
  exactKeys(header.cipher, ['algorithm', 'nonceHex', 'tagBytes']);
  validateContext({
    scope: header.scope,
    network: header.network,
    backupId: header.backupId,
    credentialId: header.credentialId,
  });
  if (
    header.version !== 1 ||
    header.purpose !== 'preview-mobile-key-local-backup' ||
    header.kdf.algorithm !== 'pbkdf2-hmac-sha256' ||
    header.kdf.iterations !== KDF_ITERATIONS ||
    header.cipher.algorithm !== 'aes-256-gcm' ||
    header.cipher.tagBytes !== 16
  )
    fail('INVALID_BACKUP_FORMAT', 'Unsupported preview backup version or crypto parameters');
  hexBytes(header.policyDigest, 32);
  hexBytes(header.mobileIdentityDigest, 32);
  hexBytes(header.kdf.saltHex, 16);
  hexBytes(header.cipher.nonceHex, 12);
  hexBytes(envelope.ciphertextHex, 32);
  hexBytes(envelope.tagHex, 16);
  return envelope;
}

/** AAD has fixed field order, independent of parsed JSON property ordering. */
function authenticatedHeader(header: BackupHeader): Buffer {
  return Buffer.from(
    JSON.stringify([
      header.version,
      header.purpose,
      header.scope,
      header.network,
      header.backupId,
      header.credentialId,
      header.policyDigest,
      header.mobileIdentityDigest,
      header.kdf.algorithm,
      header.kdf.iterations,
      header.kdf.saltHex,
      header.cipher.algorithm,
      header.cipher.nonceHex,
      header.cipher.tagBytes,
    ]),
    'utf8'
  );
}

/** Caller owns input bytes. Internal byte copies are cleared on every exit. */
export async function createPreviewMobileKeyBackupFixture(
  seed: Uint8Array,
  expected: PreviewBackupExpectation,
  crypto: PreviewBackupFixtureCrypto = UNAVAILABLE_PREVIEW_BACKUP_CRYPTO
): Promise<string> {
  requireFixtureCrypto(crypto);
  const binding = expectedBinding(expected);
  const seedCopy = copy32(seed, 'INVALID_MOBILE_SEED');
  let secret: Buffer;
  let key: Buffer;
  try {
    secret = copy32(expected.recoverySecret, 'INVALID_RECOVERY_SECRET');
    if (seedCopy.equals(secret))
      fail('RECOVERY_SECRET_REUSES_SEED', 'Recovery secret must be independent of the Mobile Key');
    assertSeedIdentity(seedCopy, binding.mobile);
    const salt = await freshBytes(crypto, 16);
    const nonce = await freshBytes(crypto, 12);
    const header: BackupHeader = {
      ...binding.context,
      version: 1,
      purpose: 'preview-mobile-key-local-backup',
      policyDigest: binding.policyDigest,
      mobileIdentityDigest: binding.mobileIdentityDigest,
      kdf: {
        algorithm: 'pbkdf2-hmac-sha256',
        iterations: KDF_ITERATIONS,
        saltHex: salt.toString('hex'),
      },
      cipher: { algorithm: 'aes-256-gcm', nonceHex: nonce.toString('hex'), tagBytes: 16 },
    };
    key = take32(await crypto.deriveKey(secret, salt, KDF_ITERATIONS), 'INVALID_DERIVED_KEY');
    const encrypted = await crypto.encrypt(key, nonce, seedCopy, authenticatedHeader(header));
    const ciphertext = Buffer.from(encrypted.ciphertext);
    const tag = Buffer.from(encrypted.tag);
    if (ciphertext.length !== 32 || tag.length !== 16) {
      fail('INVALID_CRYPTO_OUTPUT', 'Invalid authenticated encryption result');
    }
    return JSON.stringify({
      header,
      ciphertextHex: ciphertext.toString('hex'),
      tagHex: tag.toString('hex'),
    });
  } catch (error) {
    if (error instanceof PreviewMobileKeyBackupError) throw error;
    return fail('BACKUP_CRYPTO_FAILED', 'Preview backup encryption failed');
  } finally {
    seedCopy.fill(0);
    secret?.fill(0);
    key?.fill(0);
  }
}

/** Authenticates and proves exact key identity; never returns/imports the seed. */
export async function verifyPreviewMobileKeyBackupFixture(
  serialized: string,
  expected: PreviewBackupExpectation,
  crypto: PreviewBackupFixtureCrypto = UNAVAILABLE_PREVIEW_BACKUP_CRYPTO
): Promise<PreviewBackupFixtureEvidence> {
  requireFixtureCrypto(crypto);
  const binding = expectedBinding(expected);
  const { header, ciphertextHex, tagHex } = parseEnvelope(serialized);
  if (
    header.backupId !== binding.context.backupId ||
    header.credentialId !== binding.context.credentialId ||
    header.policyDigest !== binding.policyDigest ||
    header.mobileIdentityDigest !== binding.mobileIdentityDigest
  )
    fail(
      'BACKUP_CONTEXT_MISMATCH',
      'Backup does not match the independently held policy and context'
    );
  let secret: Buffer;
  let key: Buffer;
  let plaintext: Buffer;
  try {
    secret = copy32(expected.recoverySecret, 'INVALID_RECOVERY_SECRET');
    key = take32(
      await crypto.deriveKey(secret, hexBytes(header.kdf.saltHex, 16), KDF_ITERATIONS),
      'INVALID_DERIVED_KEY'
    );
    plaintext = take32(
      await crypto.decrypt(
        key,
        hexBytes(header.cipher.nonceHex, 12),
        hexBytes(ciphertextHex, 32),
        hexBytes(tagHex, 16),
        authenticatedHeader(header)
      ),
      'INVALID_RECOVERED_SEED'
    );
    if (plaintext.equals(secret)) {
      fail('RECOVERY_SECRET_REUSES_SEED', 'Recovery secret must be independent of the Mobile Key');
    }
    assertSeedIdentity(plaintext, binding.mobile);
    return {
      kind: 'local-fixture-mobile-key-backup-verified',
      network: NetworkType.TESTNET,
      backupId: binding.context.backupId,
      policyDigest: binding.policyDigest,
      mobileIdentityDigest: binding.mobileIdentityDigest,
      authenticatedEncryptionVerified: true,
      exactMobileIdentityMatched: true,
      exactFixtureReadbackVerified: false,
      cloudBackupVerified: false,
      nativeRestoreVerified: false,
      walletReady: false,
    };
  } catch (error) {
    if (error instanceof PreviewMobileKeyBackupError) throw error;
    return fail('BACKUP_AUTH_FAILED', 'Backup authentication failed');
  } finally {
    secret?.fill(0);
    key?.fill(0);
    plaintext?.fill(0);
  }
}

/** Local mock only: upload acknowledgement cannot mark a backup healthy. */
export async function writeAndVerifyPreviewMobileKeyBackupFixture(
  seed: Uint8Array,
  expected: PreviewBackupExpectation,
  transport: PreviewBackupFixtureTransport,
  crypto: PreviewBackupFixtureCrypto = UNAVAILABLE_PREVIEW_BACKUP_CRYPTO
): Promise<PreviewBackupFixtureEvidence> {
  if (
    transport?.kind !== 'local-fixture' ||
    typeof transport.write !== 'function' ||
    typeof transport.read !== 'function'
  ) {
    fail('FIXTURE_TRANSPORT_UNAVAILABLE', 'Only a local fixture transport is supported');
  }
  const { backupId } = expected.context;
  const serialized = await createPreviewMobileKeyBackupFixture(seed, expected, crypto);
  let readback: string | null;
  try {
    await transport.write(backupId, serialized);
    readback = await transport.read(backupId);
  } catch {
    return fail('FIXTURE_READBACK_FAILED', 'Fixture backup write/readback failed');
  }
  if (readback !== serialized) {
    fail('FIXTURE_READBACK_MISMATCH', 'Fixture readback is missing, stale or different');
  }
  const evidence = await verifyPreviewMobileKeyBackupFixture(readback, expected, crypto);
  return { ...evidence, exactFixtureReadbackVerified: true };
}
