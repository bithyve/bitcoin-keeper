import { Buffer } from 'buffer';
import {
  deriveDeviceMobileKeyPublic,
  DeviceMobileKeyError,
} from 'src/services/wallets/recoverable/deviceMobileKey';
import { checkPreviewMobileKeyReadback } from 'src/services/wallets/recoverable/previewMobileKeyReadback';
import BIP32Factory from 'bip32';
import * as bitcoin from 'bitcoinjs-lib';
import ecc from 'src/services/wallets/operations/taproot-utils/noble_ecc';

jest.mock('react-native-config', () => ({
  __esModule: true,
  default: { KEEPER_PREVIEW: 'true', KEEPER_PREVIEW_TESTNET_ONLY: 'true' },
}));
jest.mock('react-native-device-info', () => ({
  __esModule: true,
  default: { getBundleId: jest.fn(() => 'io.hexawallet.keeper.recoverablepreview') },
}));

const firstSeed = Buffer.alloc(32, 17);
const otherSeed = Buffer.alloc(32, 18);

describe('testnet Preview local Mobile Key readback evidence', () => {
  const mobile = deriveDeviceMobileKeyPublic(firstSeed);
  const other = deriveDeviceMobileKeyPublic(otherSeed);

  test('requires two actual public signer reads and returns no secret or full xpub', async () => {
    const read = jest.fn(async () => mobile);
    const evidence = await checkPreviewMobileKeyReadback(read, read);
    expect(read).toHaveBeenCalledTimes(2);
    expect(evidence).toMatchObject({
      kind: 'preview-mobile-key-two-read-match',
      network: 'testnet',
      masterFingerprint: mobile.masterFingerprint,
      matchedReads: 2,
      backupVerified: false,
      walletReady: false,
      recoveryVerified: false,
    });
    expect(evidence.publicIdentityTag).toMatch(/^[A-F0-9]{16}$/);
    expect(evidence).not.toHaveProperty('xpub');
    const serialized = JSON.stringify(evidence);
    expect(serialized).not.toContain(mobile.xpub);
    expect(serialized).not.toContain(firstSeed.toString('hex'));
  });

  test('same public identity produces same display tag on repeated verification', async () => {
    const a = await checkPreviewMobileKeyReadback(
      async () => mobile,
      async () => mobile
    );
    const b = await checkPreviewMobileKeyReadback(
      async () => mobile,
      async () => mobile
    );
    expect(a).toEqual(b);
  });

  test('rejects changed native Mobile Key even when same origin shape is returned', async () => {
    const read = jest.fn().mockResolvedValueOnce(mobile).mockResolvedValueOnce(other);
    await expect(checkPreviewMobileKeyReadback(read, read)).rejects.toMatchObject({
      code: 'MOBILE_KEY_CHANGED',
    });
  });

  test('rejects different public key when fingerprint is incorrectly reused', async () => {
    const read = jest
      .fn()
      .mockResolvedValueOnce(mobile)
      .mockResolvedValueOnce({ ...other, masterFingerprint: mobile.masterFingerprint });
    await expect(checkPreviewMobileKeyReadback(read, read)).rejects.toMatchObject({
      code: 'MOBILE_KEY_CHANGED',
    });
  });

  test('rejects unexpected policy origin before claiming readback', async () => {
    const read = jest.fn(async () => ({
      ...mobile,
      origin: {
        kind: 'keeper-recovery-key-bip85',
        version: 1,
        ordinal: 0,
        bip85Index: 1_000_000,
        bip85Path: "m/83696968'/39'/0'/12'/1000000'",
      },
    })) as never;
    await expect(checkPreviewMobileKeyReadback(read, read)).rejects.toMatchObject({
      code: 'INVALID_PUBLIC_SIGNER',
    });
  });

  test('propagates storage errors without reporting recovery or backup success', async () => {
    const read = jest.fn(async () => {
      throw new DeviceMobileKeyError('MOBILE_KEY_STORAGE_UNAVAILABLE', 'Store unavailable');
    });
    await expect(checkPreviewMobileKeyReadback(read, read)).rejects.toMatchObject({
      code: 'MOBILE_KEY_STORAGE_UNAVAILABLE',
    });
    expect(read).toHaveBeenCalledTimes(1);
  });

  test('uses a separate read-only reload after the first successful create/load', async () => {
    const create = jest.fn(async () => mobile);
    const reload = jest.fn(async () => mobile);
    await checkPreviewMobileKeyReadback(create, reload);
    expect(create).toHaveBeenCalledTimes(1);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  test('a missing reload record cannot be replaced by another creation call', async () => {
    const create = jest.fn(async () => mobile);
    const reload = jest.fn(async () => {
      throw new DeviceMobileKeyError('MOBILE_KEY_STORAGE_UNAVAILABLE', 'Store unavailable');
    });
    await expect(checkPreviewMobileKeyReadback(create, reload)).rejects.toMatchObject({
      code: 'MOBILE_KEY_STORAGE_UNAVAILABLE',
    });
    expect(create).toHaveBeenCalledTimes(1);
  });

  test('snapshots the first read before a native adapter mutates a shared signer object', async () => {
    const shared = { ...mobile, origin: { ...mobile.origin } };
    await expect(
      checkPreviewMobileKeyReadback(
        async () => shared,
        async () => {
          Object.assign(shared, other);
          return shared;
        }
      )
    ).rejects.toMatchObject({ code: 'MOBILE_KEY_CHANGED' });
  });

  test.each([
    { xpub: 'tpub-invalid' },
    { signerType: 'POLICY_SERVER' },
    { seed: firstSeed.toString('base64') },
    { origin: { ...mobile.origin, sourceId: 'another-device' } },
  ])('rejects malformed or secret-bearing public metadata', async (overrides) => {
    const read = jest.fn(async () => ({ ...mobile, ...overrides })) as never;
    await expect(checkPreviewMobileKeyReadback(read, read)).rejects.toMatchObject({
      code: 'INVALID_PUBLIC_SIGNER',
    });
  });

  test('does not accept a valid testnet root xpub as an account-level key', async () => {
    const xpub = BIP32Factory(ecc)
      .fromSeed(firstSeed, bitcoin.networks.testnet)
      .neutered()
      .toBase58();
    const read = jest.fn(async () => ({
      ...mobile,
      xpub,
      origin: { kind: 'device-generated', version: 1, sourceId: `device-generated:${xpub}` },
    })) as never;
    await expect(checkPreviewMobileKeyReadback(read, read)).rejects.toMatchObject({
      code: 'INVALID_PUBLIC_SIGNER',
    });
  });
});
