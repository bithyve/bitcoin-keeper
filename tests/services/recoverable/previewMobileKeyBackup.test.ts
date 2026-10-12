import BIP32Factory from 'bip32';
import * as bitcoin from 'bitcoinjs-lib';
import { Buffer } from 'buffer';
import { createCipheriv, createDecipheriv, pbkdf2, randomBytes } from 'crypto';
import { NetworkType, SignerType } from 'src/services/wallets/enums';
import ecc from 'src/services/wallets/operations/taproot-utils/noble_ecc';
import {
  createPreviewMobileKeyBackupFixture,
  verifyPreviewMobileKeyBackupFixture,
  writeAndVerifyPreviewMobileKeyBackupFixture,
  type PreviewBackupExpectation,
  type PreviewBackupFixtureCrypto,
  type PreviewBackupFixtureTransport,
} from 'src/services/wallets/recoverable/previewMobileKeyBackup';

const bip32 = BIP32Factory(ecc);
const PATH = "m/48'/1'/0'/2'";
const seed = Buffer.alloc(32, 0x11);
const recoverySecret = Buffer.alloc(32, 0xa3);

function publicKey(seedBytes: Buffer) {
  const root = bip32.fromSeed(seedBytes, bitcoin.networks.testnet);
  return {
    masterFingerprint: Buffer.from(root.fingerprint).toString('hex').toUpperCase(),
    xpub: root.derivePath(PATH).neutered().toBase58(),
    derivationPath: PATH,
  };
}

function expected(): PreviewBackupExpectation {
  return {
    recoverySecret,
    context: {
      scope: 'recoverable-preview-local-fixture',
      network: NetworkType.TESTNET,
      backupId: 'fixture-backup-1',
      credentialId: 'fixture-credential-1',
    },
    policy: {
      version: 1,
      network: NetworkType.TESTNET,
      mobile: {
        role: 'mobile',
        signerType: SignerType.MOBILE_KEY,
        ...publicKey(seed),
        origin: { kind: 'device-generated', version: 1, sourceId: 'fixture-mobile' },
      },
      hardware: {
        role: 'hardware',
        signerType: SignerType.COLDCARD,
        ...publicKey(Buffer.alloc(32, 0x22)),
        origin: {
          kind: 'hardware-device',
          device: SignerType.COLDCARD,
          transport: 'qr',
          sourceId: 'fixture-hardware',
        },
      },
      server: {
        role: 'server',
        signerType: SignerType.POLICY_SERVER,
        ...publicKey(Buffer.alloc(32, 0x33)),
        origin: { kind: 'keeper-server-key', sourceId: 'fixture-server-not-enrolled' },
      },
    },
  };
}

/** Actual Node/OpenSSL primitives, not mocked encrypt/decrypt or toy crypto. */
function nodeCrypto(): PreviewBackupFixtureCrypto {
  return {
    kind: 'local-fixture-crypto',
    randomBytes: jest.fn(async (length) => randomBytes(length)),
    deriveKey: jest.fn(
      (secretBytes, salt, iterations) =>
        new Promise<Buffer>((resolve, reject) => {
          pbkdf2(secretBytes, salt, iterations, 32, 'sha256', (error, key) => {
            if (error) reject(error);
            else resolve(key);
          });
        })
    ),
    encrypt: jest.fn(async (key, nonce, plaintext, aad) => {
      const cipher = createCipheriv('aes-256-gcm', key, nonce, { authTagLength: 16 });
      cipher.setAAD(aad);
      return {
        ciphertext: Buffer.concat([cipher.update(plaintext), cipher.final()]),
        tag: cipher.getAuthTag(),
      };
    }),
    decrypt: jest.fn(async (key, nonce, ciphertext, tag, aad) => {
      const decipher = createDecipheriv('aes-256-gcm', key, nonce, { authTagLength: 16 });
      decipher.setAAD(aad);
      decipher.setAuthTag(tag);
      return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    }),
  };
}

function mutate(record: string, change: (envelope: any) => void): string {
  const envelope = JSON.parse(record);
  change(envelope);
  return JSON.stringify(envelope);
}

function changeByte(hex: string): string {
  return (hex.startsWith('00') ? '01' : '00') + hex.slice(2);
}

describe('disconnected preview Mobile Key backup and recovery fixtures', () => {
  let serialized: string;
  beforeAll(async () => {
    serialized = await createPreviewMobileKeyBackupFixture(seed, expected(), nodeCrypto());
  });

  it('uses real authenticated encryption/KDF and verifies the exact public policy without returning secrets', async () => {
    const crypto = nodeCrypto();
    const evidence = await verifyPreviewMobileKeyBackupFixture(serialized, expected(), crypto);
    expect(evidence).toMatchObject({
      kind: 'local-fixture-mobile-key-backup-verified',
      network: NetworkType.TESTNET,
      authenticatedEncryptionVerified: true,
      exactMobileIdentityMatched: true,
      exactFixtureReadbackVerified: false,
      cloudBackupVerified: false,
      nativeRestoreVerified: false,
      walletReady: false,
    });
    expect(evidence.policyDigest).toMatch(/^[0-9a-f]{64}$/);
    expect(crypto.deriveKey).toHaveBeenCalledWith(
      expect.any(Uint8Array),
      expect.any(Uint8Array),
      600_000
    );
    const publicResults = serialized + JSON.stringify(evidence);
    for (const secret of [
      seed.toString('hex'),
      seed.toString('base64'),
      recoverySecret.toString('hex'),
    ]) {
      expect(publicResults).not.toContain(secret);
    }
    expect(publicResults).not.toContain(expected().policy.mobile.xpub);
    expect(seed).toEqual(Buffer.alloc(32, 0x11));
    expect(recoverySecret).toEqual(Buffer.alloc(32, 0xa3));
  });

  it('requests fresh salt and nonce on each encryption; identical keys produce different ciphertext', async () => {
    const crypto = nodeCrypto();
    const next = await createPreviewMobileKeyBackupFixture(seed, expected(), crypto);
    expect(crypto.randomBytes).toHaveBeenNthCalledWith(1, 16);
    expect(crypto.randomBytes).toHaveBeenNthCalledWith(2, 12);
    const first = JSON.parse(serialized);
    const second = JSON.parse(next);
    expect(second.header.kdf.saltHex).not.toBe(first.header.kdf.saltHex);
    expect(second.header.cipher.nonceHex).not.toBe(first.header.cipher.nonceHex);
    expect(second.ciphertextHex).not.toBe(first.ciphertextHex);
    expect(second.header.policyDigest).toBe(first.header.policyDigest);
  });

  it.each([
    [
      'ciphertext',
      (envelope) => {
        envelope.ciphertextHex = changeByte(envelope.ciphertextHex);
      },
    ],
    [
      'tag',
      (envelope) => {
        envelope.tagHex = changeByte(envelope.tagHex);
      },
    ],
    [
      'salt',
      (envelope) => {
        envelope.header.kdf.saltHex = changeByte(envelope.header.kdf.saltHex);
      },
    ],
    [
      'nonce',
      (envelope) => {
        envelope.header.cipher.nonceHex = changeByte(envelope.header.cipher.nonceHex);
      },
    ],
  ])('rejects tampered %s under real AES-GCM', async (_, change) => {
    await expect(
      verifyPreviewMobileKeyBackupFixture(mutate(serialized, change), expected(), nodeCrypto())
    ).rejects.toMatchObject({ code: 'BACKUP_AUTH_FAILED' });
  });

  it('rejects the wrong independently held recovery secret', async () => {
    const wrong = expected();
    wrong.recoverySecret = Buffer.alloc(32, 0xa4);
    await expect(
      verifyPreviewMobileKeyBackupFixture(serialized, wrong, nodeCrypto())
    ).rejects.toMatchObject({ code: 'BACKUP_AUTH_FAILED' });
  });

  it.each([
    [
      'hardware key',
      (input: PreviewBackupExpectation) => {
        Object.assign(input.policy.hardware, publicKey(Buffer.alloc(32, 0x44)));
      },
    ],
    [
      'server key',
      (input: PreviewBackupExpectation) => {
        Object.assign(input.policy.server, publicKey(Buffer.alloc(32, 0x55)));
      },
    ],
    [
      'Mobile key',
      (input: PreviewBackupExpectation) => {
        Object.assign(input.policy.mobile, publicKey(Buffer.alloc(32, 0x66)));
      },
    ],
    [
      'Mobile origin',
      (input: PreviewBackupExpectation) => {
        input.policy.mobile.origin = {
          kind: 'device-generated',
          version: 1,
          sourceId: 'different-mobile-source',
        };
      },
    ],
    [
      'hardware transport',
      (input: PreviewBackupExpectation) => {
        input.policy.hardware.origin.transport = 'file';
      },
    ],
    [
      'backup ID',
      (input: PreviewBackupExpectation) => {
        input.context.backupId = 'different-backup';
      },
    ],
    [
      'credential ID',
      (input: PreviewBackupExpectation) => {
        input.context.credentialId = 'different-credential';
      },
    ],
  ])('rejects a record from a different %s before doing KDF work', async (_, change) => {
    const wrong = expected();
    change(wrong);
    const crypto = nodeCrypto();
    await expect(
      verifyPreviewMobileKeyBackupFixture(serialized, wrong, crypto)
    ).rejects.toMatchObject({ code: 'BACKUP_CONTEXT_MISMATCH' });
    expect(crypto.deriveKey).not.toHaveBeenCalled();
  });

  it('authenticates policy/credential headers even when the caller expectation is also relabelled', async () => {
    const modified = mutate(serialized, (envelope) => {
      envelope.header.credentialId = 'relabelled-credential';
    });
    const relabelled = expected();
    relabelled.context.credentialId = 'relabelled-credential';
    await expect(
      verifyPreviewMobileKeyBackupFixture(modified, relabelled, nodeCrypto())
    ).rejects.toMatchObject({ code: 'BACKUP_AUTH_FAILED' });
  });

  it('rejects an authenticated ciphertext carrying a different seed than the trusted public policy', async () => {
    const crypto = nodeCrypto();
    const encrypt = crypto.encrypt;
    crypto.encrypt = async (key, nonce, _, aad) => encrypt(key, nonce, Buffer.alloc(32, 0x77), aad);
    const wrongSeedRecord = await createPreviewMobileKeyBackupFixture(seed, expected(), crypto);
    await expect(
      verifyPreviewMobileKeyBackupFixture(wrongSeedRecord, expected(), nodeCrypto())
    ).rejects.toMatchObject({ code: 'MOBILE_IDENTITY_MISMATCH' });
  });

  it('also rejects externally produced authenticated records that reuse the recovery secret as the seed', async () => {
    const crypto = nodeCrypto();
    const encrypt = crypto.encrypt;
    crypto.encrypt = async (key, nonce, _, aad) => encrypt(key, nonce, recoverySecret, aad);
    const reusedSecretRecord = await createPreviewMobileKeyBackupFixture(seed, expected(), crypto);
    await expect(
      verifyPreviewMobileKeyBackupFixture(reusedSecretRecord, expected(), nodeCrypto())
    ).rejects.toMatchObject({ code: 'RECOVERY_SECRET_REUSES_SEED' });
  });

  it.each([
    [
      'version',
      (envelope) => {
        envelope.header.version = 2;
      },
    ],
    [
      'cipher',
      (envelope) => {
        envelope.header.cipher.algorithm = 'aes-256-cbc';
      },
    ],
    [
      'KDF algorithm',
      (envelope) => {
        envelope.header.kdf.algorithm = 'sha256';
      },
    ],
    [
      'too few KDF iterations',
      (envelope) => {
        envelope.header.kdf.iterations = 1;
      },
    ],
    [
      'unbounded KDF iterations',
      (envelope) => {
        envelope.header.kdf.iterations = 2 ** 53;
      },
    ],
    [
      'short ciphertext',
      (envelope) => {
        envelope.ciphertextHex = '00';
      },
    ],
    [
      'short tag',
      (envelope) => {
        envelope.tagHex = '00';
      },
    ],
    [
      'noncanonical bytes',
      (envelope) => {
        envelope.header.kdf.saltHex = 'GG'.repeat(16);
      },
    ],
    [
      'extra field',
      (envelope) => {
        envelope.privateSeed = 'unexpected';
      },
    ],
    [
      'extra header field',
      (envelope) => {
        envelope.header.walletReady = true;
      },
    ],
    [
      'missing field',
      (envelope) => {
        delete envelope.header.mobileIdentityDigest;
      },
    ],
    [
      'null header',
      (envelope) => {
        envelope.header = null;
      },
    ],
    [
      'array KDF',
      (envelope) => {
        envelope.header.kdf = [];
      },
    ],
  ])('rejects unsupported %s without attacker-controlled KDF work', async (_, change) => {
    const crypto = nodeCrypto();
    await expect(
      verifyPreviewMobileKeyBackupFixture(mutate(serialized, change), expected(), crypto)
    ).rejects.toMatchObject({ code: 'INVALID_BACKUP_FORMAT' });
    expect(crypto.deriveKey).not.toHaveBeenCalled();
  });

  it.each(['not-json', '[]', 'null', 'x'.repeat(4097)])(
    'bounds parsing and rejects malformed records',
    async (record) => {
      const crypto = nodeCrypto();
      await expect(
        verifyPreviewMobileKeyBackupFixture(record, expected(), crypto)
      ).rejects.toMatchObject({ code: 'INVALID_BACKUP_FORMAT' });
      expect(crypto.deriveKey).not.toHaveBeenCalled();
    }
  );

  it('blocks mainnet, production/cloud contexts and inherited policies', async () => {
    const crypto = nodeCrypto();
    const mainnet = expected();
    mainnet.policy.network = NetworkType.MAINNET as never;
    await expect(createPreviewMobileKeyBackupFixture(seed, mainnet, crypto)).rejects.toMatchObject({
      code: 'TESTNET_ONLY',
    });
    const production = expected();
    production.context.scope = 'production' as never;
    await expect(
      createPreviewMobileKeyBackupFixture(seed, production, crypto)
    ).rejects.toMatchObject({ code: 'TESTNET_FIXTURE_ONLY' });
    const inherited = expected();
    inherited.policy.inheritance = {} as never;
    await expect(
      createPreviewMobileKeyBackupFixture(seed, inherited, crypto)
    ).rejects.toMatchObject({ code: 'INHERITANCE_BACKUP_UNVERIFIED' });
    expect(crypto.randomBytes).not.toHaveBeenCalled();
  });

  it.each([0, 16, 31, 33, 100000])(
    'requires a bounded 32-byte recovery secret (%s rejected)',
    async (length) => {
      const input = expected();
      input.recoverySecret = Buffer.alloc(length);
      const crypto = nodeCrypto();
      await expect(createPreviewMobileKeyBackupFixture(seed, input, crypto)).rejects.toMatchObject({
        code: 'INVALID_RECOVERY_SECRET',
      });
      await expect(
        verifyPreviewMobileKeyBackupFixture(serialized, input, crypto)
      ).rejects.toMatchObject({ code: 'INVALID_RECOVERY_SECRET' });
      expect(crypto.deriveKey).not.toHaveBeenCalled();
    }
  );

  it('never backs up a mismatched seed or uses the seed itself as its recovery secret', async () => {
    const crypto = nodeCrypto();
    await expect(
      createPreviewMobileKeyBackupFixture(Buffer.alloc(32, 0x99), expected(), crypto)
    ).rejects.toMatchObject({ code: 'MOBILE_IDENTITY_MISMATCH' });
    const input = expected();
    input.recoverySecret = seed;
    await expect(createPreviewMobileKeyBackupFixture(seed, input, crypto)).rejects.toMatchObject({
      code: 'RECOVERY_SECRET_REUSES_SEED',
    });
    expect(crypto.randomBytes).not.toHaveBeenCalled();
  });

  it('fails closed with no native crypto adapter or cloud transport', async () => {
    await expect(createPreviewMobileKeyBackupFixture(seed, expected())).rejects.toMatchObject({
      code: 'NATIVE_BACKUP_UNAVAILABLE',
    });
    await expect(verifyPreviewMobileKeyBackupFixture(serialized, expected())).rejects.toMatchObject(
      { code: 'NATIVE_BACKUP_UNAVAILABLE' }
    );
    await expect(
      writeAndVerifyPreviewMobileKeyBackupFixture(
        seed,
        expected(),
        { kind: 'google-drive' } as never,
        nodeCrypto()
      )
    ).rejects.toMatchObject({ code: 'FIXTURE_TRANSPORT_UNAVAILABLE' });
  });

  it('reports fixture readback only after exact write/read match and successful decryption', async () => {
    let stored: string | null = null;
    const transport: PreviewBackupFixtureTransport = {
      kind: 'local-fixture',
      write: jest.fn(async (_, record) => {
        stored = record;
      }),
      read: jest.fn(async () => stored),
    };
    const evidence = await writeAndVerifyPreviewMobileKeyBackupFixture(
      seed,
      expected(),
      transport,
      nodeCrypto()
    );
    expect(transport.read).toHaveBeenCalledWith('fixture-backup-1');
    expect(evidence.exactFixtureReadbackVerified).toBe(true);
    expect(evidence.cloudBackupVerified).toBe(false);
    expect(evidence.nativeRestoreVerified).toBe(false);
  });

  it.each(['missing', 'stale', 'modified', 'unreadable'])(
    'does not treat a successful write with %s readback as healthy',
    async (scenario) => {
      let stored: string;
      const transport: PreviewBackupFixtureTransport = {
        kind: 'local-fixture',
        write: jest.fn(async (_, record) => {
          stored = record;
        }),
        read: jest.fn(async () => {
          if (scenario === 'unreadable') throw new Error('transport failure');
          if (scenario === 'missing') return null;
          if (scenario === 'stale') return serialized;
          return mutate(stored, (envelope) => {
            envelope.tagHex = changeByte(envelope.tagHex);
          });
        }),
      };
      const crypto = nodeCrypto();
      await expect(
        writeAndVerifyPreviewMobileKeyBackupFixture(seed, expected(), transport, crypto)
      ).rejects.toMatchObject({
        code: scenario === 'unreadable' ? 'FIXTURE_READBACK_FAILED' : 'FIXTURE_READBACK_MISMATCH',
      });
      expect(transport.write).toHaveBeenCalledTimes(1);
      expect(crypto.decrypt).not.toHaveBeenCalled();
    }
  );

  it('clears service-owned secret/key/plaintext bytes while retaining caller-owned inputs', async () => {
    const crypto = nodeCrypto();
    let derived: Uint8Array;
    let decrypted: Uint8Array;
    const derive = crypto.deriveKey;
    const decrypt = crypto.decrypt;
    crypto.deriveKey = jest.fn(async (...args) => {
      derived = await derive(...args);
      return derived;
    });
    crypto.decrypt = jest.fn(async (...args) => {
      decrypted = await decrypt(...args);
      return decrypted;
    });
    await verifyPreviewMobileKeyBackupFixture(serialized, expected(), crypto);
    expect(Buffer.from(derived)).toEqual(Buffer.alloc(32));
    expect(Buffer.from(decrypted)).toEqual(Buffer.alloc(32));
    expect(Buffer.from((crypto.deriveKey as jest.Mock).mock.calls[0][0])).toEqual(Buffer.alloc(32));
    expect(recoverySecret).toEqual(Buffer.alloc(32, 0xa3));
  });

  it('clears derived keys and redacts adapter error messages on failed authentication', async () => {
    const crypto = nodeCrypto();
    let derived: Uint8Array;
    const derive = crypto.deriveKey;
    crypto.deriveKey = async (...args) => {
      derived = await derive(...args);
      return derived;
    };
    crypto.decrypt = async () => {
      throw new Error('sensitive adapter detail');
    };
    await expect(
      verifyPreviewMobileKeyBackupFixture(serialized, expected(), crypto)
    ).rejects.toMatchObject({
      code: 'BACKUP_AUTH_FAILED',
      message: 'Backup authentication failed',
    });
    expect(Buffer.from(derived)).toEqual(Buffer.alloc(32));
  });
});
