import { Buffer } from 'buffer';
import {
  deriveDeviceMobileKeyPublic,
  DeviceMobileKeyError,
} from 'src/services/wallets/recoverable/deviceMobileKey';
import { checkPreviewMobileKeyReadback } from 'src/services/wallets/recoverable/previewMobileKeyReadback';

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
    const evidence = await checkPreviewMobileKeyReadback(read);
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
    const a = await checkPreviewMobileKeyReadback(async () => mobile);
    const b = await checkPreviewMobileKeyReadback(async () => mobile);
    expect(a).toEqual(b);
  });

  test('rejects changed native Mobile Key even when same origin shape is returned', async () => {
    const read = jest.fn().mockResolvedValueOnce(mobile).mockResolvedValueOnce(other);
    await expect(checkPreviewMobileKeyReadback(read)).rejects.toMatchObject({
      code: 'MOBILE_KEY_CHANGED',
    });
  });

  test('rejects different public key when fingerprint is incorrectly reused', async () => {
    const read = jest
      .fn()
      .mockResolvedValueOnce(mobile)
      .mockResolvedValueOnce({ ...other, masterFingerprint: mobile.masterFingerprint });
    await expect(checkPreviewMobileKeyReadback(read)).rejects.toMatchObject({
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
    await expect(checkPreviewMobileKeyReadback(read)).rejects.toMatchObject({
      code: 'INVALID_PUBLIC_SIGNER',
    });
  });

  test('propagates storage errors without reporting recovery or backup success', async () => {
    const read = jest.fn(async () => {
      throw new DeviceMobileKeyError('MOBILE_KEY_STORAGE_UNAVAILABLE', 'Store unavailable');
    });
    await expect(checkPreviewMobileKeyReadback(read)).rejects.toMatchObject({
      code: 'MOBILE_KEY_STORAGE_UNAVAILABLE',
    });
    expect(read).toHaveBeenCalledTimes(1);
  });
});
