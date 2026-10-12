import * as bitcoin from 'bitcoinjs-lib';
import { Buffer } from 'buffer';
import {
  DeviceMobileKeyError,
  getOrCreatePreviewDeviceMobileKey,
} from './deviceMobileKey';
import type { RecoverableMobileSigner } from './policyDraft';

/**
 * A LOCAL, opt-in diagnostic. It may create the native Preview Mobile Key,
 * then reads it a second time. No wallet, server key, funding, backup, signing
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

function isExpectedPreviewSigner(
  signer: RecoverableMobileSigner
): signer is RecoverableMobileSigner & {
  origin: Extract<RecoverableMobileSigner['origin'], { kind: 'device-generated' }>;
} {
  return (
    signer?.role === 'mobile' &&
    signer?.origin?.kind === 'device-generated' &&
    signer.origin.version === 1 &&
    signer.derivationPath === "m/48'/1'/0'/2'" &&
    typeof signer.masterFingerprint === 'string' &&
    /^[A-F0-9]{8}$/.test(signer.masterFingerprint) &&
    typeof signer.xpub === 'string' &&
    signer.xpub.startsWith('tpub')
  );
}

export async function checkPreviewMobileKeyReadback(
  read: () => Promise<RecoverableMobileSigner> = getOrCreatePreviewDeviceMobileKey
): Promise<PreviewMobileKeyReadbackEvidence> {
  const first = await read();
  if (!isExpectedPreviewSigner(first)) {
    throw new DeviceMobileKeyError(
      'INVALID_PUBLIC_SIGNER',
      'Native Mobile Key returned unexpected public metadata'
    );
  }
  const second = await read();
  if (
    !isExpectedPreviewSigner(second) ||
    first.masterFingerprint !== second.masterFingerprint ||
    first.xpub !== second.xpub ||
    first.derivationPath !== second.derivationPath ||
    first.origin.sourceId !== second.origin.sourceId
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
