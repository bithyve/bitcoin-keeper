import BIP32Factory from 'bip32';
import * as bitcoin from 'bitcoinjs-lib';
import { Buffer } from 'buffer';
import { NetworkType } from '../enums';
import { DescriptorChecksum } from '../operations/descriptors/checksum';
import ecc from '../operations/taproot-utils/noble_ecc';
import {
  buildRecoverablePolicyReview,
  RecoverablePolicyDraftError,
  type RecoverablePolicyDraftInput,
  type RecoverablePublicSignerBase,
} from './policyDraft';

const bip32 = BIP32Factory(ecc);

/**
 * An independent, PUBLIC-ONLY reference for the base 2-of-3 testnet script.
 * This is NOT a wallet factory, not proof of hardware possession, not an
 * enrolled Server Key, not backup verification and not a receive-address API.
 *
 * It uses the same sortedmulti/P2WSH construction as Keeper's existing
 * DEFAULT_MULTISIG wallet operations. Do not connect this to wallet activation,
 * receive UI, chain syncing or real funds.
 */
export interface RecoverableTestnetScriptVector {
  kind: 'unfundable-testnet-2-of-3-vector';
  network: NetworkType.TESTNET;
  threshold: 2;
  signers: 3;
  /** Multipath, checksummed, PUBLIC descriptor. No signing secret is present. */
  descriptor: string;
  /** Never display for deposits: the server and hardware are not yet verified. */
  referenceAddress: string;
  scriptPubKey: Buffer;
  witnessScript: Buffer;
  internal: boolean;
  index: number;
  fundable: false;
}

function keyExpression(signer: RecoverablePublicSignerBase): string {
  const origin = signer.derivationPath.slice(2).replace(/'/g, 'h');
  return '[' + signer.masterFingerprint + '/' + origin + ']' +
    signer.xpub + '/<0;1>/*';
}

/** Deterministic reference script. Every caller remains blocked from funding. */
export function deriveRecoverableTestnetScriptVector(
  input: RecoverablePolicyDraftInput,
  internal: boolean,
  index: number
): RecoverableTestnetScriptVector {
  if (typeof internal !== 'boolean' ||
      !Number.isSafeInteger(index) || index < 0 || index > 1000) {
    throw new RecoverablePolicyDraftError(
      'INVALID_ADDRESS_INDEX',
      'Reference derivation needs a receive/change choice and index 0–1000'
    );
  }

  // Validate all origin metadata, network, 2-of-3 threshold, and distinct
  // account keys using the existing preview policy validator.
  const review = buildRecoverablePolicyReview(input);
  if (review.inheritance !== null || review.baseVaultScheme === null) {
    throw new RecoverablePolicyDraftError(
      'INHERITANCE_NOT_TESTED',
      'Delayed inheritance needs a separate verified Miniscript script and signer test'
    );
  }
  const network = bitcoin.networks.testnet;
  const signers = review.base.signers;
  const pubkeys = signers
    .map((signer) => Buffer.from(
      bip32.fromBase58(signer.xpub, network)
        .derive(internal ? 1 : 0)
        .derive(index).publicKey
    ))
    .sort(Buffer.compare); // BIP67, matching Keeper's default 2-of-3.

  const p2ms = bitcoin.payments.p2ms({ m: 2, pubkeys, network });
  const p2wsh = bitcoin.payments.p2wsh({ redeem: p2ms, network });
  if (!p2ms.output || !p2wsh.output || !p2wsh.address) {
    throw new Error('Could not construct a native-segwit 2-of-3 reference script');
  }

  const descriptorBody = 'wsh(sortedmulti(2,' +
    signers.map(keyExpression).join(',') + '))';
  const checksum = DescriptorChecksum(descriptorBody);
  if (checksum.length !== 8) {
    throw new Error('Could not checksum the reference descriptor');
  }

  return {
    kind: 'unfundable-testnet-2-of-3-vector',
    network: NetworkType.TESTNET,
    threshold: 2,
    signers: 3,
    descriptor: descriptorBody + '#' + checksum,
    referenceAddress: p2wsh.address,
    scriptPubKey: Buffer.from(p2wsh.output),
    witnessScript: Buffer.from(p2ms.output),
    internal,
    index,
    fundable: false,
  };
}
