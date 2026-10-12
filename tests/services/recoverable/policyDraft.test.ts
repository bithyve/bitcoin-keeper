import BIP32Factory from 'bip32';
import * as bitcoin from 'bitcoinjs-lib';
import bs58check from 'bs58check';
import ecc from 'src/services/wallets/operations/taproot-utils/noble_ecc';
import { NetworkType, SignerType, MultisigScriptType } from 'src/services/wallets/enums';
import {
  buildRecoverablePolicyReview,
  RecoverableHardwareSigner,
  RecoverableInheritanceChoice,
  RecoverableMobileSigner,
  RecoverablePolicyDraftInput,
  RecoverablePolicyDraftError,
  RecoverableServerSigner,
} from 'src/services/wallets/recoverable/policyDraft';
import { generateScriptWitnesses } from 'src/services/wallets/operations/miniscript/miniscript';

const bip32 = BIP32Factory(ecc);
const signerPath = "m/48'/1'/0'/2'";

function publicKeyFor(seedByte: number) {
  const root = bip32.fromSeed(Buffer.alloc(32, seedByte), bitcoin.networks.testnet);
  return {
    masterFingerprint: root.fingerprint.toString('hex').toUpperCase(),
    xpub: root.derivePath(signerPath).neutered().toBase58(),
    derivationPath: signerPath,
  };
}

function input(): RecoverablePolicyDraftInput {
  const mobile: RecoverableMobileSigner = {
    role: 'mobile',
    signerType: SignerType.MOBILE_KEY,
    ...publicKeyFor(1),
    origin: {
      kind: 'device-generated',
      version: 1,
      sourceId: 'preview-device-mobile-key-1',
    },
  };
  const hardware: RecoverableHardwareSigner = {
    role: 'hardware',
    signerType: SignerType.COLDCARD,
    ...publicKeyFor(2),
    origin: {
      kind: 'hardware-device',
      device: SignerType.COLDCARD,
      transport: 'qr',
      sourceId: 'test-coldcard-1',
    },
  };
  const server: RecoverableServerSigner = {
    role: 'server',
    signerType: SignerType.POLICY_SERVER,
    ...publicKeyFor(3),
    origin: { kind: 'keeper-server-key', sourceId: 'test-public-server-1' },
  };
  return { version: 1, network: NetworkType.TESTNET, mobile, hardware, server };
}

function inputWithRecoveryKeyOrigin(): RecoverablePolicyDraftInput {
  const draft = input();
  draft.mobile.origin = {
    kind: 'keeper-recovery-key-bip85',
    version: 1,
    ordinal: 0,
    bip85Index: 1_000_000,
    bip85Path: "m/83696968'/39'/0'/12'/1000000'",
  };
  return draft;
}

function inheritance(): RecoverableInheritanceChoice {
  return {
    signer: {
      role: 'inheritance',
      signerType: SignerType.SEED_WORDS,
      ...publicKeyFor(4),
      origin: { kind: 'externally-held-inheritance-key', sourceId: 'test-heir-1' },
    },
    activation: {
      kind: 'block-height',
      value: 85_012,
      observedHeight: 85_000,
      observedMedianTimePast: 1_700_000_000,
    },
  };
}

function expectCode(action: () => unknown, code: string) {
  try {
    action();
    throw new Error(`Expected ${code}`);
  } catch (error) {
    expect(error).toBeInstanceOf(RecoverablePolicyDraftError);
    expect((error as RecoverablePolicyDraftError).code).toBe(code);
  }
}

describe('public Recoverable Wallet policy draft', () => {
  test('keeps a complete fixed 2-of-3 public review separate from wallet creation', () => {
    const review = buildRecoverablePolicyReview(input());
    expect(review).toMatchObject({
      kind: 'public-policy-review',
      network: NetworkType.TESTNET,
      base: { required: 2, total: 3 },
      inheritance: null,
      fundable: false,
      hardwarePolicyStatus: 'plain-multisig-not-device-tested',
    });
    expect(review.base.signers.map((signer) => signer.role)).toEqual([
      'mobile',
      'hardware',
      'server',
    ]);
    expect(review.baseVaultScheme).toEqual({
      m: 2,
      n: 3,
      multisigScriptType: MultisigScriptType.DEFAULT_MULTISIG,
    });
    expect(review.candidateMiniscript).toBeNull();
    expect(review.base.signers[0].origin).toEqual({
      kind: 'device-generated',
      version: 1,
      sourceId: 'preview-device-mobile-key-1',
    });
    expect(JSON.stringify(review)).not.toMatch(/xpriv|mnemonic|recoveryKey/i);
  });

  test('accepts explicit optional Recovery Key derivation metadata without requiring it', () => {
    const review = buildRecoverablePolicyReview(inputWithRecoveryKeyOrigin());
    expect(review.base.signers[0].origin).toEqual({
      kind: 'keeper-recovery-key-bip85',
      version: 1,
      ordinal: 0,
      bip85Index: 1_000_000,
      bip85Path: "m/83696968'/39'/0'/12'/1000000'",
    });
    expect(review.fundable).toBe(false);
  });

  test('compiles an optional delayed 2-of-4 candidate before final policy review', () => {
    const review = buildRecoverablePolicyReview({ ...input(), inheritance: inheritance() });
    const scheme = review.candidateMiniscript;
    expect(review.inheritance).toMatchObject({ required: 2, total: 4 });
    expect(review.hardwarePolicyStatus).toBe('inheritance-policy-not-device-tested');
    expect(review.fundable).toBe(false);
    expect(review.baseVaultScheme).toBeNull();
    expect(scheme?.policy).toContain('after(85012)');
    expect(scheme?.phases).toHaveLength(2);
    expect(scheme?.phases[0]).toEqual({ timelock: 0, signerCount: 3, required: 2 });
    expect(scheme?.phases[1]).toEqual({ timelock: 85_012, signerCount: 4, required: 2 });
    expect(scheme?.miniscript).toBeTruthy();
    const { scriptWitnesses } = generateScriptWitnesses(scheme!.policy);
    expect(scriptWitnesses.length).toBeGreaterThan(0);
    for (const witness of scriptWitnesses) {
      // Compiler satisfactions are candidate review data, not Bitcoin consensus
      // execution or a hardware signing test. No heir-containing path is early.
      const signatures = witness.asm.match(/sig\((?:K[123]|IK1)(?:<\d+;\d+>)?\)/g) || [];
      expect(signatures).toHaveLength(2);
      if (witness.asm.includes('IK1')) expect(witness.nLockTime).toBe(85_012);
    }
    for (const originalSigner of ['K1', 'K2', 'K3']) {
      expect(
        scriptWitnesses.some(
          (witness) =>
            witness.nLockTime === 85_012 &&
            witness.asm.includes('IK1') &&
            witness.asm.includes(originalSigner)
        )
      ).toBe(true);
    }
  });

  test('rejects a production network and mainnet xpub', () => {
    const draft = input();
    expectCode(
      () => buildRecoverablePolicyReview({ ...draft, network: NetworkType.MAINNET } as any),
      'TESTNET_ONLY'
    );
    const mainnetRoot = bip32.fromSeed(Buffer.alloc(32, 5), bitcoin.networks.bitcoin);
    draft.hardware.xpub = mainnetRoot.derivePath("m/48'/0'/0'/2'").neutered().toBase58();
    expectCode(() => buildRecoverablePolicyReview(draft), 'INVALID_XPUB');
  });

  test('rejects a root tpub or a tpub from the wrong final derivation child', () => {
    const root = bip32.fromSeed(Buffer.alloc(32, 7), bitcoin.networks.testnet);
    const rootKey = input();
    rootKey.hardware.xpub = root.neutered().toBase58();
    expectCode(() => buildRecoverablePolicyReview(rootKey), 'INVALID_XPUB_ORIGIN');

    const wrongChild = input();
    wrongChild.hardware.xpub = root.derivePath("m/48'/1'/0'/3'").neutered().toBase58();
    expectCode(() => buildRecoverablePolicyReview(wrongChild), 'INVALID_XPUB_ORIGIN');
  });

  test('rejects private material and malformed Mobile Key origin metadata', () => {
    const withPrivate = input();
    (withPrivate.mobile as any).xpriv = 'must-never-enter-a-policy-draft';
    expectCode(() => buildRecoverablePolicyReview(withPrivate), 'PRIVATE_MATERIAL');

    const nestedPrivate = input();
    (nestedPrivate.mobile.origin as any).mnemonic = 'must-never-enter-a-policy-draft';
    expectCode(() => buildRecoverablePolicyReview(nestedPrivate), 'PRIVATE_MATERIAL');

    const missingGeneratedSource = input();
    missingGeneratedSource.mobile.origin = {
      kind: 'device-generated',
      version: 1,
      sourceId: ' ',
    };
    expectCode(() => buildRecoverablePolicyReview(missingGeneratedSource), 'INVALID_ORIGIN');

    const inventedRecoveryClaim = input();
    (inventedRecoveryClaim.mobile.origin as any).bip85Index = 1_000_000;
    expectCode(() => buildRecoverablePolicyReview(inventedRecoveryClaim), 'UNEXPECTED_FIELD');

    const wrongMobilePath = inputWithRecoveryKeyOrigin();
    (wrongMobilePath.mobile.origin as any).bip85Index = 10;
    expectCode(() => buildRecoverablePolicyReview(wrongMobilePath), 'INVALID_MOBILE_ORIGIN');

    const unsupportedOrigin = input();
    (unsupportedOrigin.mobile.origin as any).kind = 'unknown';
    expectCode(() => buildRecoverablePolicyReview(unsupportedOrigin), 'INVALID_MOBILE_ORIGIN');

    const wrongSignerPath = input();
    wrongSignerPath.mobile.derivationPath = "m/48'/0'/0'/2'";
    expectCode(() => buildRecoverablePolicyReview(wrongSignerPath), 'INVALID_DERIVATION');
  });

  test('rejects duplicate material even when roles differ', () => {
    const sameFingerprint = input();
    sameFingerprint.server.masterFingerprint = sameFingerprint.mobile.masterFingerprint;
    expectCode(() => buildRecoverablePolicyReview(sameFingerprint), 'DUPLICATE_KEY');

    const sameXpub = input();
    sameXpub.hardware.xpub = sameXpub.mobile.xpub;
    expectCode(() => buildRecoverablePolicyReview(sameXpub), 'DUPLICATE_KEY');
  });

  test.each([false, 0, '', [], {}])(
    'rejects malformed explicit inheritance choice %j instead of dropping it',
    (inheritanceChoice) => {
      expect(() =>
        buildRecoverablePolicyReview({
          ...input(),
          inheritance: inheritanceChoice,
        } as any)
      ).toThrow(RecoverablePolicyDraftError);
    }
  );

  test.each(['m', 'n', 'threshold', 'required'])(
    'rejects an attempt to override fixed quorum using %s',
    (field) => {
      const draft = input();
      (draft as any)[field] = 1;
      expectCode(() => buildRecoverablePolicyReview(draft), 'UNEXPECTED_FIELD');
    }
  );

  test.each([
    'invented-signer',
    SignerType.UNKOWN_SIGNER,
    SignerType.POLICY_SERVER,
    SignerType.MOBILE_KEY,
  ])('rejects unsupported inheritance signer type %s', (signerType) => {
    const choice = inheritance();
    choice.signer.signerType = signerType as SignerType;
    expectCode(
      () => buildRecoverablePolicyReview({ ...input(), inheritance: choice }),
      'INVALID_INHERITANCE_ORIGIN'
    );
  });

  test.each([false, true])(
    'rejects a relabelled account signing key even with changed chain code: %s',
    (changeChainCode) => {
      const draft = input();
      const encoded = Buffer.from(bs58check.decode(draft.mobile.xpub));
      // BIP32 parent fingerprint and chain code can be relabelled without
      // changing the actual serialized account public key at bytes 45–77.
      encoded[5] ^= 1;
      if (changeChainCode) encoded[13] ^= 1;
      draft.hardware.xpub = bs58check.encode(encoded);
      expect(draft.hardware.xpub).not.toBe(draft.mobile.xpub);
      expect(draft.hardware.masterFingerprint).not.toBe(draft.mobile.masterFingerprint);
      expectCode(() => buildRecoverablePolicyReview(draft), 'DUPLICATE_KEY');
    }
  );

  test('rejects a relabelled inheritance signer from an existing role', () => {
    const draft = input();
    const heir = inheritance();
    const encoded = Buffer.from(bs58check.decode(draft.server.xpub));
    encoded[5] ^= 1;
    heir.signer.xpub = bs58check.encode(encoded);
    expectCode(
      () => buildRecoverablePolicyReview({ ...draft, inheritance: heir }),
      'DUPLICATE_KEY'
    );
  });

  test('rejects inherited policy fields and accessor data without evaluating it', () => {
    const draft = input();
    draft.hardware = Object.create(draft.hardware);
    expectCode(() => buildRecoverablePolicyReview(draft), 'INVALID_POLICY_DATA');

    const getter = jest.fn(() => input().mobile.xpub);
    const withAccessor = input();
    Object.defineProperty(withAccessor.mobile, 'xpub', { enumerable: true, get: getter });
    expectCode(() => buildRecoverablePolicyReview(withAccessor), 'INVALID_POLICY_DATA');
    expect(getter).not.toHaveBeenCalled();
  });

  test('rejects hidden or differently cased private metadata', () => {
    const withHiddenSecret = input();
    Object.defineProperty(withHiddenSecret.server, 'private_key', { value: 'secret' });
    expectCode(() => buildRecoverablePolicyReview(withHiddenSecret), 'PRIVATE_MATERIAL');

    const withCasedSecret = input();
    (withCasedSecret.mobile.origin as any).XPRV = 'secret';
    expectCode(() => buildRecoverablePolicyReview(withCasedSecret), 'PRIVATE_MATERIAL');

    const withPrivateReference = input();
    withPrivateReference.server.origin.sourceId = bip32
      .fromSeed(Buffer.alloc(32, 8), bitcoin.networks.testnet)
      .derivePath(signerPath)
      .toBase58();
    expectCode(() => buildRecoverablePolicyReview(withPrivateReference), 'PRIVATE_MATERIAL');
  });

  test('blocks hardware and transport combinations that cannot verify this policy', () => {
    const tapsigner = input();
    tapsigner.hardware.signerType = SignerType.TAPSIGNER;
    tapsigner.hardware.origin.device = SignerType.TAPSIGNER;
    tapsigner.hardware.origin.transport = 'nfc';
    expect(buildRecoverablePolicyReview(tapsigner).base.total).toBe(3);
    expectCode(
      () => buildRecoverablePolicyReview({ ...tapsigner, inheritance: inheritance() }),
      'UNSUPPORTED_HARDWARE_POLICY'
    );
    const invalidTransport = input();
    invalidTransport.hardware.origin.transport = 'file';
    invalidTransport.hardware.signerType = SignerType.JADE;
    invalidTransport.hardware.origin.device = SignerType.JADE;
    expectCode(() => buildRecoverablePolicyReview(invalidTransport), 'UNSUPPORTED_HARDWARE');
  });

  test('requires a future absolute inheritance locktime from supplied chain state', () => {
    const draft = input();
    const expired = inheritance();
    expired.activation.value = expired.activation.observedHeight;
    expectCode(
      () => buildRecoverablePolicyReview({ ...draft, inheritance: expired }),
      'INVALID_ACTIVATION'
    );

    const wrongType = inheritance();
    wrongType.activation.kind = 'median-time-past';
    expectCode(
      () => buildRecoverablePolicyReview({ ...draft, inheritance: wrongType }),
      'INVALID_ACTIVATION'
    );
  });

  test.each([
    ['block-height', 500_000_000],
    ['median-time-past', 0x100000000],
    ['median-time-past', 1_700_000_000],
  ])('rejects inheritance %s locktime boundary %s', (kind, value) => {
    const choice = inheritance();
    choice.activation.kind = kind as 'block-height' | 'median-time-past';
    choice.activation.value = value as number;
    expectCode(
      () => buildRecoverablePolicyReview({ ...input(), inheritance: choice }),
      'INVALID_ACTIVATION'
    );
  });

  test('compiles a future median-time-past candidate without enabling funding', () => {
    const choice = inheritance();
    choice.activation.kind = 'median-time-past';
    choice.activation.value = 1_700_000_600;
    const review = buildRecoverablePolicyReview({ ...input(), inheritance: choice });
    expect(review.candidateMiniscript!.policy).toContain('after(1700000600)');
    expect(review.baseVaultScheme).toBeNull();
    expect(review.fundable).toBe(false);
  });
});
