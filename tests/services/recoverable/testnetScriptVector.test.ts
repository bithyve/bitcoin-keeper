import BIP32Factory from 'bip32';
import * as bitcoin from 'bitcoinjs-lib';
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
    expect(result.scriptPubKey).toEqual(bitcoin.address.toOutputScript(result.referenceAddress, bitcoin.networks.testnet));
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

  test.each([
    [-1],
    [1.25],
    [1001],
    [Number.NaN],
    [Number.POSITIVE_INFINITY],
  ])('fails closed for unsupported derivation index %s', (index) => {
    expect(() => deriveRecoverableTestnetScriptVector(fixture(), false, index)).toThrow(
      RecoverablePolicyDraftError
    );
  });

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
    const keys = [1, 2, 3].map((byte) =>
      bip32.fromSeed(Buffer.alloc(32, byte), bitcoin.networks.testnet)
        .derivePath(PATH).derive(0).derive(0)
    );
    const vector = deriveRecoverableTestnetScriptVector(fixture(), false, 0);
    const makePsbt = () => {
      const destination = bitcoin.payments.p2wpkh({
        pubkey: Buffer.from(keys[0].publicKey),
        network: bitcoin.networks.testnet,
      }).address!;
      return new bitcoin.Psbt({ network: bitcoin.networks.testnet })
        .addInput({
          hash: '11'.repeat(32),
          index: 0,
          witnessUtxo: { script: vector.scriptPubKey, value: 100_000 },
          witnessScript: vector.witnessScript,
        })
        .addOutput({ address: destination, value: 99_000 });
    };

    const insufficient = makePsbt();
    insufficient.signInput(0, keys[pair[0]]);
    expect(() => insufficient.finalizeAllInputs()).toThrow();

    const complete = makePsbt();
    complete.signInput(0, keys[pair[0]]);
    complete.signInput(0, keys[pair[1]]);
    complete.finalizeAllInputs();
    const witness = complete.extractTransaction().ins[0].witness;
    expect(witness).toHaveLength(4); // empty CHECKMULTISIG item + two sigs + witnessScript
    expect(witness[0]).toHaveLength(0);
    expect(witness[3]).toEqual(vector.witnessScript);
  });
});
