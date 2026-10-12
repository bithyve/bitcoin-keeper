import BIP32Factory from 'bip32';
import * as bitcoin from 'bitcoinjs-lib';
import bs58check from 'bs58check';
import { Buffer } from 'buffer';
import { NetworkType, SignerType } from 'src/services/wallets/enums';
import ecc from 'src/services/wallets/operations/taproot-utils/noble_ecc';
import {
  type RecoverablePolicyDraftInput,
  RecoverablePolicyDraftError,
} from 'src/services/wallets/recoverable/policyDraft';
import { deriveRecoverableTestnetScriptVector } from 'src/services/wallets/recoverable/testnetScriptVector';

const bip32 = BIP32Factory(ecc);
const PATH = "m/48'/1'/0'/2'";

function publicKeyFor(seedByte: number) {
  const root = bip32.fromSeed(Buffer.alloc(32, seedByte), bitcoin.networks.testnet);
  return {
    masterFingerprint: Buffer.from(root.fingerprint).toString('hex').toUpperCase(),
    xpub: root.derivePath(PATH).neutered().toBase58(),
    derivationPath: PATH,
  };
}

function fixture(): RecoverablePolicyDraftInput {
  return {
    version: 1,
    network: NetworkType.TESTNET,
    mobile: {
      role: 'mobile',
      signerType: SignerType.MOBILE_KEY,
      ...publicKeyFor(1),
      origin: { kind: 'device-generated', version: 1, sourceId: 'test-mobile' },
    },
    hardware: {
      role: 'hardware',
      signerType: SignerType.COLDCARD,
      ...publicKeyFor(2),
      origin: {
        kind: 'hardware-device',
        device: SignerType.COLDCARD,
        transport: 'qr',
        sourceId: 'test-hardware',
      },
    },
    server: {
      role: 'server',
      signerType: SignerType.POLICY_SERVER,
      ...publicKeyFor(3),
      origin: { kind: 'keeper-server-key', sourceId: 'test-server-not-enrolled' },
    },
  };
}

function signingKeys(internal = false, index = 0) {
  return [1, 2, 3].map((byte) =>
    bip32
      .fromSeed(Buffer.alloc(32, byte), bitcoin.networks.testnet)
      .derivePath(PATH)
      .derive(internal ? 1 : 0)
      .derive(index)
  );
}

function syntheticPsbt(internal = false, index = 0) {
  const keys = signingKeys(internal, index);
  const vector = deriveRecoverableTestnetScriptVector(fixture(), internal, index);
  const destination = bitcoin.payments.p2wpkh({
    pubkey: Buffer.from(keys[0].publicKey),
    network: bitcoin.networks.testnet,
  }).address!;
  const psbt = new bitcoin.Psbt({ network: bitcoin.networks.testnet })
    .addInput({
      hash: '11'.repeat(32),
      index: 0,
      witnessUtxo: { script: vector.scriptPubKey, value: 100_000 },
      witnessScript: vector.witnessScript,
    })
    .addOutput({ address: destination, value: 99_000 });
  return { keys, vector, psbt };
}

/**
 * Independently verify ordered CHECKMULTISIG ECDSA witnesses against the final
 * transaction hash and spent amount. BitcoinJS finalization alone does not
 * validate signatures and is never sufficient signing proof.
 */
function verifySyntheticWitness(
  tx: bitcoin.Transaction,
  witnessScript: Buffer,
  spentValue = 100_000
): boolean {
  try {
    const chunks = bitcoin.script.decompile(witnessScript)!;
    if (
      chunks?.length !== 6 ||
      chunks[0] !== bitcoin.opcodes.OP_2 ||
      chunks[4] !== bitcoin.opcodes.OP_3 ||
      chunks[5] !== bitcoin.opcodes.OP_CHECKMULTISIG
    )
      return false;
    const pubkeys = chunks.slice(1, 4) as Buffer[];
    if (!pubkeys.every(Buffer.isBuffer)) return false;
    const witness = tx.ins[0].witness;
    if (witness.length !== 4 || witness[0].length !== 0 || !witness[3].equals(witnessScript))
      return false;
    let keyIndex = 0;
    for (const encoded of witness.slice(1, 3)) {
      const { signature, hashType } = bitcoin.script.signature.decode(encoded);
      if (hashType !== bitcoin.Transaction.SIGHASH_ALL) return false;
      const digest = tx.hashForWitnessV0(0, witnessScript, spentValue, hashType);
      while (keyIndex < pubkeys.length && !ecc.verify(digest, pubkeys[keyIndex], signature)) {
        keyIndex += 1;
      }
      if (keyIndex === pubkeys.length) return false;
      keyIndex += 1;
    }
    return true;
  } catch (_) {
    return false;
  }
}

describe('Assisted Multisig offline testnet script and signing vectors', () => {
  test('matches Keeper existing multisig testnet descriptor and receive-address oracle', () => {
    // This known public-only descriptor/address is already exercised by
    // tests/services/vault.test.ts; it is independent of the new builder.
    const test = fixture();
    test.mobile.masterFingerprint = '4192760B';
    test.mobile.xpub =
      'tpubDFCfoi7h1QdAuVVCCBQ8hMdeqcxztV53EB9Qd6cRZ5Tdh94jCPknyhU1mcpCWPzLz2mAVHFdnK1uLKserS1h2sVSJrZvQyghGugQrUpnSrW';
    test.hardware.masterFingerprint = 'AE6E3031';
    test.hardware.xpub =
      'tpubDEbEY1b4Rkaieyi2xUstuVy9ur1be16edv8DrpXqGke2ABqjxoUvxJDLqcdUQmEHyBvgutLwBJ9ciiUijg7cC1A1jKEcxN43xk2W9pMGaCJ';
    test.server.masterFingerprint = 'C7D9EAF5';
    test.server.xpub =
      'tpubDEFf521xjx9TGwajRXBca5bBRNmr9iqa4xLAAytgZ6weCNKKgErF8qgXFGifgYJGF9zLHvPHK6hZHWxeJd4kMkmqcbBMQmCSfnJmUgeNqJ8';

    const result = deriveRecoverableTestnetScriptVector(test, false, 0);
    expect(result.referenceAddress).toBe(
      'tb1qfkv399k9knrjysqvfjt0s352c6pun9v4nmh9uxvacsz57m86cyfsz0runl'
    );
    expect(result.descriptor).toBe(
      'wsh(sortedmulti(2,[4192760B/48h/1h/0h/2h]tpubDFCfoi7h1QdAuVVCCBQ8hMdeqcxztV53EB9Qd6cRZ5Tdh94jCPknyhU1mcpCWPzLz2mAVHFdnK1uLKserS1h2sVSJrZvQyghGugQrUpnSrW/<0;1>/*,[AE6E3031/48h/1h/0h/2h]tpubDEbEY1b4Rkaieyi2xUstuVy9ur1be16edv8DrpXqGke2ABqjxoUvxJDLqcdUQmEHyBvgutLwBJ9ciiUijg7cC1A1jKEcxN43xk2W9pMGaCJ/<0;1>/*,[C7D9EAF5/48h/1h/0h/2h]tpubDEFf521xjx9TGwajRXBca5bBRNmr9iqa4xLAAytgZ6weCNKKgErF8qgXFGifgYJGF9zLHvPHK6hZHWxeJd4kMkmqcbBMQmCSfnJmUgeNqJ8/<0;1>/*))#g47ywxzw'
    );
    expect(result.kind).toBe('unfundable-testnet-2-of-3-vector');
    expect(result.fundable).toBe(false);
    expect(result.scriptPubKey).toEqual(
      bitcoin.address.toOutputScript(result.referenceAddress, bitcoin.networks.testnet)
    );
  });

  test('separates receive/change branches and never produces a mainnet address', () => {
    const input = fixture();
    const a = deriveRecoverableTestnetScriptVector(input, false, 0);
    const b = deriveRecoverableTestnetScriptVector(input, true, 0);
    const c = deriveRecoverableTestnetScriptVector(input, false, 1);
    expect(new Set([a.referenceAddress, b.referenceAddress, c.referenceAddress]).size).toBe(3);
    expect(a.referenceAddress).toMatch(/^tb1q/);
    expect(b.referenceAddress).toMatch(/^tb1q/);
    expect(a.descriptor).toBe(b.descriptor);
    expect(a.descriptor).toBe(c.descriptor);
    expect(a.fundable).toBe(false);
  });

  test.each([[-1], [1.25], [1001], [Number.NaN], [Number.POSITIVE_INFINITY]])(
    'fails closed for unsupported derivation index %s',
    (index) => {
      expect(() => deriveRecoverableTestnetScriptVector(fixture(), false, index)).toThrow(
        RecoverablePolicyDraftError
      );
    }
  );

  test('rejects a nonboolean branch selector and the mainnet network', () => {
    expect(() => deriveRecoverableTestnetScriptVector(fixture(), 'false' as never, 0)).toThrow(
      RecoverablePolicyDraftError
    );
    const input = fixture();
    input.network = NetworkType.MAINNET as never;
    expect(() => deriveRecoverableTestnetScriptVector(input, false, 0)).toThrow(
      RecoverablePolicyDraftError
    );
  });

  test('rejects a repeated signer before an address is derived', () => {
    const input = fixture();
    input.hardware.masterFingerprint = input.mobile.masterFingerprint;
    expect(() => deriveRecoverableTestnetScriptVector(input, false, 0)).toThrow(
      RecoverablePolicyDraftError
    );
  });

  test('rejects relabelled duplicate account keys before script derivation', () => {
    const input = fixture();
    const encoded = Buffer.from(bs58check.decode(input.mobile.xpub));
    encoded[5] ^= 1;
    input.hardware.xpub = bs58check.encode(encoded);
    expect(() => deriveRecoverableTestnetScriptVector(input, false, 0)).toThrow(
      /independent key material/
    );
  });

  test('does not reuse the base-2-of-3 script for an inheritance wallet', () => {
    const input = fixture();
    input.inheritance = {
      signer: {
        role: 'inheritance',
        signerType: SignerType.SEED_WORDS,
        ...publicKeyFor(4),
        origin: { kind: 'externally-held-inheritance-key', sourceId: 'heir-test-only' },
      },
      activation: {
        kind: 'block-height',
        value: 85_012,
        observedHeight: 85_000,
        observedMedianTimePast: 1_700_000_000,
      },
    };
    expect(() => deriveRecoverableTestnetScriptVector(input, false, 0)).toThrow(
      /separate verified Miniscript/
    );
  });

  test.each([
    ['Mobile + Hardware', [0, 1]],
    ['Mobile + Server', [0, 2]],
    ['Hardware + Server', [1, 2]],
  ])('a real BitcoinJS PSBT can be finalized by %s without the third signer', (_, pair) => {
    // Test-only deterministic private keys and a synthetic UTXO: this proves
    // script/signature satisfaction, NOT network broadcast or server enrollment.
    for (const [internal, index] of [
      [false, 0],
      [true, 0],
      [false, 1000],
    ] as const) {
      const { keys, vector, psbt: insufficient } = syntheticPsbt(internal, index);
      insufficient.signInput(0, keys[pair[0]]);
      expect(() => insufficient.finalizeAllInputs()).toThrow();

      const { psbt: complete } = syntheticPsbt(internal, index);
      complete.signInput(0, keys[pair[0]]);
      complete.signInput(0, keys[pair[1]]);
      expect(
        complete.validateSignaturesOfAllInputs((pubkey, hash, signature) =>
          ecc.verify(hash, pubkey, signature)
        )
      ).toBe(true);
      complete.finalizeAllInputs();
      const tx = complete.extractTransaction();
      expect(tx.ins[0].witness).toHaveLength(4);
      expect(tx.ins[0].witness[0]).toHaveLength(0);
      expect(tx.ins[0].witness[3]).toEqual(vector.witnessScript);
      expect(verifySyntheticWitness(tx, vector.witnessScript)).toBe(true);
    }
  });

  test('BIP67 sorts actual child public keys and P2WSH commits to the whole witness script', () => {
    for (const [internal, index] of [
      [false, 0],
      [true, 0],
      [false, 1000],
    ] as const) {
      const { keys, vector } = syntheticPsbt(internal, index);
      const expectedKeys = keys.map((key) => Buffer.from(key.publicKey)).sort(Buffer.compare);
      expect(bitcoin.script.decompile(vector.witnessScript)).toEqual([
        bitcoin.opcodes.OP_2,
        ...expectedKeys,
        bitcoin.opcodes.OP_3,
        bitcoin.opcodes.OP_CHECKMULTISIG,
      ]);
      expect(vector.scriptPubKey).toEqual(
        Buffer.concat([
          Buffer.from([bitcoin.opcodes.OP_0, 32]),
          bitcoin.crypto.sha256(vector.witnessScript),
        ])
      );
    }
  });

  test('rejects unrelated keys and keys from a different receive/change derivation', () => {
    const { psbt } = syntheticPsbt();
    const outsider = bip32
      .fromSeed(Buffer.alloc(32, 9), bitcoin.networks.testnet)
      .derivePath(PATH)
      .derive(0)
      .derive(0);
    for (const wrongKey of [outsider, signingKeys(true)[0], signingKeys(false, 1)[0]]) {
      expect(() => psbt.signInput(0, wrongKey)).toThrow();
    }
    expect(() => psbt.finalizeAllInputs()).toThrow();
  });

  test('detects tampered signatures even when the PSBT can be finalized', () => {
    const { keys, vector, psbt } = syntheticPsbt();
    psbt.signInput(0, keys[0]);
    psbt.signInput(0, keys[1]);
    const partial = psbt.data.inputs[0].partialSig![0];
    const decoded = bitcoin.script.signature.decode(partial.signature);
    decoded.signature[0] ^= 1;
    partial.signature = bitcoin.script.signature.encode(decoded.signature, decoded.hashType);
    expect(
      psbt.validateSignaturesOfAllInputs((pubkey, hash, signature) =>
        ecc.verify(hash, pubkey, signature)
      )
    ).toBe(false);
    psbt.finalizeAllInputs();
    expect(verifySyntheticWitness(psbt.extractTransaction(), vector.witnessScript)).toBe(false);
  });

  test('binds valid signatures to the exact input, outputs, amount and witness order', () => {
    const { keys, vector, psbt } = syntheticPsbt();
    psbt.signInput(0, keys[0]);
    psbt.signInput(0, keys[1]);
    psbt.finalizeAllInputs();
    const tx = psbt.extractTransaction();
    expect(verifySyntheticWitness(tx, vector.witnessScript)).toBe(true);
    expect(verifySyntheticWitness(tx, vector.witnessScript, 100_001)).toBe(false);

    const changedOutput = tx.clone();
    changedOutput.outs[0].value -= 1;
    expect(verifySyntheticWitness(changedOutput, vector.witnessScript)).toBe(false);
    const changedInput = tx.clone();
    changedInput.ins[0].index += 1;
    expect(verifySyntheticWitness(changedInput, vector.witnessScript)).toBe(false);
    const swapped = bitcoin.Transaction.fromBuffer(tx.toBuffer());
    [swapped.ins[0].witness[1], swapped.ins[0].witness[2]] = [
      swapped.ins[0].witness[2],
      swapped.ins[0].witness[1],
    ];
    expect(verifySyntheticWitness(swapped, vector.witnessScript)).toBe(false);
    const repeated = bitcoin.Transaction.fromBuffer(tx.toBuffer());
    repeated.ins[0].witness[2] = Buffer.from(repeated.ins[0].witness[1]);
    expect(verifySyntheticWitness(repeated, vector.witnessScript)).toBe(false);
  });
});
