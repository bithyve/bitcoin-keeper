import { detectSensitiveInput, detectSensitiveInDraft } from 'src/utils/helpAiSensitiveData';
import type { HelpDraft } from 'src/models/interfaces/HelpAi';


describe('detectSensitiveInput — mnemonic detection', () => {
  it('returns kind mnemonic for a valid 12-word BIP39 mnemonic', () => {
    const result = detectSensitiveInput(
      'abandon ability able about above absent absorb abstract absurd abuse access accident'
    );
    expect(result).not.toBeNull();
    expect(result?.kind).toBe('mnemonic');
  });

  it('returns kind mnemonic for a valid 24-word BIP39 mnemonic', () => {
    const result = detectSensitiveInput(
      'zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo vote'
    );
    expect(result).not.toBeNull();
    expect(result?.kind).toBe('mnemonic');
  });

  it('returns kind mnemonic for exactly 8 consecutive BIP39 words', () => {
    const result = detectSensitiveInput(
      'abandon ability able about above absent absorb abstract'
    );
    expect(result).not.toBeNull();
    expect(result?.kind).toBe('mnemonic');
  });

  it('returns null for 7 consecutive BIP39 words (below threshold)', () => {
    const result = detectSensitiveInput(
      'abandon ability able about above absent absorb'
    );
    expect(result).toBeNull();
  });

  it('returns null for a clean benign support question', () => {
    expect(detectSensitiveInput('Why is my transaction pending?')).toBeNull();
    expect(detectSensitiveInput('How do I backup my wallet?')).toBeNull();
    expect(detectSensitiveInput('I need help with my Coldcard setup')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(detectSensitiveInput('')).toBeNull();
  });

  it('detects mnemonic embedded within surrounding text', () => {
    const result = detectSensitiveInput(
      'Here it is: abandon ability able about above absent absorb abstract absurd abuse — those are the first ten'
    );
    expect(result).not.toBeNull();
    expect(result?.kind).toBe('mnemonic');
  });
});


describe('detectSensitiveInput — extended key detection', () => {
  const XPRV =
    'xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqhuCh8J' +
    'GefGSVpNfmGhp7DBHubEpK7FKDMbQBMxDMVBZpQoNM6xQnYFT';
  const ZPRV =
    'zprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqhuCh8J' +
    'GefGSVpNfmGhp7DBHubEpK7FKDMbQBMxDMVBZpQoNM6xQnYFT';
  const TPRV =
    'tprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqhuCh8J' +
    'GefGSVpNfmGhp7DBHubEpK7FKDMbQBMxDMVBZpQoNM6xQnYFT';
  const XPUB =
    'xpub6FNxwLzfLRiwdbRUc9xDjEY6dSuv1GsC2VgqYbKpwdRT9j8G7HNAWCpHzaor' +
    'f443eCQMJdtNieTD9MVYEgvRJNJ3MeoePdV8DGGiehsJckKabcd';

  it('returns kind extended_private_key for a full xprv string', () => {
    const result = detectSensitiveInput(`My key is ${XPRV}`);
    expect(result).not.toBeNull();
    expect(result?.kind).toBe('extended_private_key');
  });

  it('returns kind extended_private_key for zprv variant', () => {
    const result = detectSensitiveInput(ZPRV);
    expect(result).not.toBeNull();
    expect(result?.kind).toBe('extended_private_key');
  });

  it('returns kind extended_private_key for tprv (testnet) variant', () => {
    const result = detectSensitiveInput(TPRV);
    expect(result).not.toBeNull();
    expect(result?.kind).toBe('extended_private_key');
  });

  it('returns kind extended_public_key for a full xpub string', () => {
    const result = detectSensitiveInput(XPUB);
    expect(result).not.toBeNull();
    expect(result?.kind).toBe('extended_public_key');
  });

  it('returns null for the word "xpub" alone (no long base58 suffix)', () => {
    expect(detectSensitiveInput('How do I find my xpub?')).toBeNull();
    expect(detectSensitiveInput('I read about xpub in the docs')).toBeNull();
  });

  it('returns null for the word "xprv" alone', () => {
    expect(detectSensitiveInput('I read about xprv format in BIP32')).toBeNull();
  });
});


describe('detectSensitiveInput — WIF key detection', () => {
  // Realistic-length WIF keys (52 chars for K/L, 51 for 5)
  const WIF_K = 'KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73NUTaaa';
  // WIF uncompressed mainnet: starts with 5, total 51 chars, valid base58 only (no 0,O,I,l)
  const WIF_5 = '5HueCGU8rMjxECyDiaxwujn7vByAa7MqVZhA9YQCLGwBBmZabbb';

  it('returns kind wif_key for a WIF key starting with K', () => {
    const result = detectSensitiveInput(`My WIF: ${WIF_K}`);
    expect(result).not.toBeNull();
    expect(result?.kind).toBe('wif_key');
  });

  it('returns kind wif_key for a WIF key starting with 5', () => {
    const result = detectSensitiveInput(WIF_5);
    expect(result).not.toBeNull();
    expect(result?.kind).toBe('wif_key');
  });
});


describe('detectSensitiveInput — keyword detection', () => {
  const keywordCases: [string, string][] = [
    ['seed phrase', 'my seed phrase is lost'],
    ['recovery phrase', 'I need to enter my recovery phrase'],
    ['backup phrase', 'where do I find my backup phrase'],
    ['mnemonic', 'the mnemonic for my wallet'],
    ['private key', 'my private key was compromised'],
    ['secret key', 'what is a secret key'],
    ['xpriv', 'I have an xpriv from my hardware wallet'],
  ];

  it.each(keywordCases)('blocks message containing "%s"', (_keyword, message) => {
    const result = detectSensitiveInput(message);
    expect(result).not.toBeNull();
    expect(result?.kind).toBe('keyword');
  });

  it('returns null for a message containing only the word "passphrase"', () => {
    expect(detectSensitiveInput('How do I set a passphrase on my Coldcard?')).toBeNull();
    expect(detectSensitiveInput('What is a BIP39 passphrase?')).toBeNull();
    expect(detectSensitiveInput('I forgot my passphrase')).toBeNull();
  });

  it('returns null for normal help questions', () => {
    expect(detectSensitiveInput('How do I add a new signer?')).toBeNull();
    expect(detectSensitiveInput('My transaction has been pending for 2 days')).toBeNull();
    expect(detectSensitiveInput('Something is not working in the app')).toBeNull();
  });
});


describe('detectSensitiveInDraft', () => {
  it('returns a result when the title field contains a keyword phrase', () => {
    const draft: HelpDraft = {
      kind: 'bug',
      title: 'Issue with my seed phrase backup',
    };
    const result = detectSensitiveInDraft(draft);
    expect(result).not.toBeNull();
    expect(result?.kind).toBe('keyword');
  });

  it('returns a result when a steps entry contains a BIP39 mnemonic sequence', () => {
    const draft: HelpDraft = {
      kind: 'bug',
      title: 'Cannot restore wallet',
      steps: [
        'Open the app',
        'abandon ability able about above absent absorb abstract absurd abuse',
        'Tap restore',
      ],
    };
    const result = detectSensitiveInDraft(draft);
    expect(result).not.toBeNull();
    expect(result?.kind).toBe('mnemonic');
  });

  it('returns a result when the problem field contains an xpub key', () => {
    const xpub =
      'xpub6FNxwLzfLRiwdbRUc9xDjEY6dSuv1GsC2VgqYbKpwdRT9j8G7HNAWCpHzaor' +
      'f443eCQMJdtNieTD9MVYEgvRJNJ3MeoePdV8DGGiehsJckKabcd';
    const draft: HelpDraft = {
      kind: 'bug',
      title: 'Watch-only wallet issue',
      problem: `I pasted ${xpub} but the wallet does not load`,
    };
    const result = detectSensitiveInDraft(draft);
    expect(result).not.toBeNull();
    expect(result?.kind).toBe('extended_public_key');
  });

  it('returns null for a clean draft with no sensitive content', () => {
    const draft: HelpDraft = {
      kind: 'bug',
      title: 'Transaction stuck in mempool',
      steps: ['Open wallet', 'Tap Send', 'Observe pending status'],
      expected: 'Transaction confirms within 10 minutes',
      actual: 'Transaction shows pending after 2 hours',
    };
    expect(detectSensitiveInDraft(draft)).toBeNull();
  });

  it('returns null for an empty draft', () => {
    const draft: HelpDraft = {
      kind: 'feature',
      title: '',
    };
    expect(detectSensitiveInDraft(draft)).toBeNull();
  });
});
