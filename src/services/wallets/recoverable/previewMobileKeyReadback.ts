import BIP32Factory from 'bip32';
import * as bitcoin from 'bitcoinjs-lib';
import { Buffer } from 'buffer';
import {
  DeviceMobileKeyError,
  getOrCreatePreviewDeviceMobileKey,
  readExistingPreviewDeviceMobileKey,
} from './deviceMobileKey';
import { SignerType } from '../enums';
import ecc from '../operations/taproot-utils/noble_ecc';
import type { RecoverableMobileSigner } from './policyDraft';

const bip32 = BIP32Factory(ecc);

/**
 * A LOCAL, opt-in diagnostic. It may create the native Preview Mobile Key,
 * then reads the existing record without permission to create a replacement.
 * No wallet, server key, funding, backup, signing
 * authority, or recovery capability is created or implied.
 *
 * This cannot prove continuity across a process restart or reinstall. The
 * public identity must later be bound to durable wallet and recovery records.
 */
export interface PreviewMobileKeyReadbackEvidence {
  kind: 'preview-mobile-key-two-read-match';
  network: 'testnet';
  masterFingerprint: string;
  /** Short hash of PUBLIC account xpub, not the xpub or private seed itself. */
  publicIdentityTag: string;
  matchedReads: 2;
  backupVerified: false;
  walletReady: false;
  recoveryVerified: false;
}

function snapshotExpectedPreviewSigner(signer: RecoverableMobileSigner): {
  masterFingerprint: string;
  xpub: string;
  derivationPath: string;
  sourceId: string;
} {
  const validShape =
    signer?.role === 'mobile' &&
    signer.signerType === SignerType.MOBILE_KEY &&
    signer?.origin?.kind === 'device-generated' &&
    signer.origin.version === 1 &&
    signer.derivationPath === "m/48'/1'/0'/2'" &&
    typeof signer.masterFingerprint === 'string' &&
    /^[A-F0-9]{8}$/.test(signer.masterFingerprint) &&
    typeof signer.xpub === 'string' &&
    signer.xpub.length <= 120 &&
    signer.origin.sourceId === `device-generated:${signer.xpub}` &&
    Object.keys(signer).every((key) =>
      ['role', 'signerType', 'origin', 'derivationPath', 'masterFingerprint', 'xpub'].includes(key)
    ) &&
    Object.keys(signer.origin).every((key) => ['kind', 'version', 'sourceId'].includes(key));
  let validAccountKey = false;
  if (validShape) {
    try {
      const node = bip32.fromBase58(signer.xpub, bitcoin.networks.testnet);
      validAccountKey = node.isNeutered() && node.depth === 4 && node.index === 0x80000002;
    } catch {
      validAccountKey = false;
    }
  }
  if (!validShape || !validAccountKey) {
    throw new DeviceMobileKeyError(
      'INVALID_PUBLIC_SIGNER',
      'Native Mobile Key returned unexpected public metadata'
    );
  }
  // Copy values before the next asynchronous call: a mutable reused object
  // must not rewrite the first observation and conceal a changed key.
  return {
    masterFingerprint: signer.masterFingerprint,
    xpub: signer.xpub,
    derivationPath: signer.derivationPath,
    sourceId: (signer.origin as { sourceId: string }).sourceId,
  };
}

export async function checkPreviewMobileKeyReadback(
  read: () => Promise<RecoverableMobileSigner> = getOrCreatePreviewDeviceMobileKey,
  readExisting: () => Promise<RecoverableMobileSigner> = readExistingPreviewDeviceMobileKey
): Promise<PreviewMobileKeyReadbackEvidence> {
  const first = snapshotExpectedPreviewSigner(await read());
  const second = snapshotExpectedPreviewSigner(await readExisting());
  if (
    first.masterFingerprint !== second.masterFingerprint ||
    first.xpub !== second.xpub ||
    first.derivationPath !== second.derivationPath ||
    first.sourceId !== second.sourceId
  ) {
    throw new DeviceMobileKeyError(
      'MOBILE_KEY_CHANGED',
      'Mobile Key public identity changed between native reads'
    );
  }

  // Public, display-only correlation tag: no seed, xprv, or complete xpub.
  const tag = Buffer.from(bitcoin.crypto.sha256(Buffer.from(first.xpub, 'utf8')))
    .toString('hex')
    .slice(0, 16)
    .toUpperCase();
  return {
    kind: 'preview-mobile-key-two-read-match',
    network: 'testnet',
    masterFingerprint: first.masterFingerprint,
    publicIdentityTag: tag,
    matchedReads: 2,
    backupVerified: false,
    walletReady: false,
    recoveryVerified: false,
  };
}
