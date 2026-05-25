import { HelpDraft } from 'src/models/interfaces/HelpAi';
import { BIP39_WORD_SET } from 'src/constants/bip39WordSet';

export type SensitiveDetectionResult = {
  kind: 'mnemonic' | 'extended_private_key' | 'extended_public_key' | 'wif_key' | 'keyword';
  message: string;
};

// ─── Private detectors ────────────────────────────────────────────────────────

/**
 * Detects actual extended private key strings (xprv/yprv/zprv + variants) by
 * requiring the 4-char prefix to be followed by ≥100 base58 characters.
 * The word "xprv" alone, without a long suffix, does NOT trigger this.
 */
const EXTENDED_PRIVATE_KEY_PATTERN =
  /\b(xprv|yprv|zprv|Xprv|Yprv|Zprv|tprv|uprv|vprv)[1-9A-HJ-NP-Za-km-z]{100,}\b/;

/**
 * Detects actual extended public key strings (xpub/ypub/zpub + variants).
 * Same length requirement — the word "xpub" alone does NOT trigger this.
 */
const EXTENDED_PUBLIC_KEY_PATTERN =
  /\b(xpub|ypub|zpub|Xpub|Ypub|Zpub|tpub|upub|vpub)[1-9A-HJ-NP-Za-km-z]{100,}\b/;

/**
 * Detects WIF-encoded private keys:
 *   5…  = mainnet uncompressed (51 chars)
 *   K…  = mainnet compressed   (52 chars)
 *   L…  = mainnet compressed   (52 chars)
 *   c…  = testnet              (52 chars)
 */
const WIF_KEY_PATTERN = /\b[5KLc][1-9A-HJ-NP-Za-km-z]{49,51}\b/;

/**
 * Keyword phrases that indicate the user is describing sensitive key material,
 * even if they haven't pasted the actual value.
 * "passphrase" is intentionally excluded — too many false positives for
 * legitimate BIP39 passphrase feature questions.
 */
const KEYWORD_PATTERNS: RegExp[] = [
  /seed\s+phrase/i,
  /recovery\s+phrase/i,
  /backup\s+phrase/i,
  /secret\s+phrase/i,
  /\bmnemonic\b/i,
  /private\s+key/i,
  /\bprivatekey\b/i,
  /secret\s+key/i,
  /\bxpriv\b/i,
];

/** Minimum number of consecutive BIP39 words to flag as a potential mnemonic. */
const MNEMONIC_THRESHOLD = 8;

function detectExtendedPrivateKey(text: string): SensitiveDetectionResult | null {
  if (EXTENDED_PRIVATE_KEY_PATTERN.test(text)) {
    return {
      kind: 'extended_private_key',
      message: 'This looks like an extended private key. Please remove it — private keys must never be shared.',
    };
  }
  return null;
}

function detectExtendedPublicKey(text: string): SensitiveDetectionResult | null {
  if (EXTENDED_PUBLIC_KEY_PATTERN.test(text)) {
    return {
      kind: 'extended_public_key',
      message: 'This looks like an extended public key (xpub). Please remove it — sharing your xpub exposes your full transaction history.',
    };
  }
  return null;
}

function detectWIF(text: string): SensitiveDetectionResult | null {
  if (WIF_KEY_PATTERN.test(text)) {
    return {
      kind: 'wif_key',
      message: 'This looks like a private key. Please remove it — private keys must never be shared.',
    };
  }
  return null;
}

function detectMnemonic(text: string): SensitiveDetectionResult | null {
  const tokens = text.toLowerCase().trim().split(/\s+/);
  let consecutiveCount = 0;

  for (const token of tokens) {
    if (BIP39_WORD_SET.has(token)) {
      consecutiveCount++;
      if (consecutiveCount >= MNEMONIC_THRESHOLD) {
        return {
          kind: 'mnemonic',
          message: 'This looks like a seed phrase. Please remove it — seed words must never be shared.',
        };
      }
    } else {
      consecutiveCount = 0;
    }
  }

  return null;
}

function detectKeywords(text: string): SensitiveDetectionResult | null {
  for (const pattern of KEYWORD_PATTERNS) {
    if (pattern.test(text)) {
      return {
        kind: 'keyword',
        message: 'Please remove any sensitive information like seed phrases or private keys before sending.',
      };
    }
  }
  return null;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Scans a chat input string for sensitive Bitcoin key material.
 * Runs detectors in priority order: extended keys → WIF → mnemonic → keywords.
 *
 * @returns A detection result describing what was found, or `null` if clean.
 */
export function detectSensitiveInput(text: string): SensitiveDetectionResult | null {
  if (!text) return null;
  return (
    detectExtendedPrivateKey(text) ??
    detectExtendedPublicKey(text) ??
    detectWIF(text) ??
    detectMnemonic(text) ??
    detectKeywords(text)
  );
}

/**
 * Scans all string fields of a `HelpDraft` for sensitive Bitcoin key material.
 * Concatenates title, steps, expected, actual, problem, and proposed before scanning.
 *
 * @returns A detection result describing what was found, or `null` if clean.
 */
export function detectSensitiveInDraft(draft: HelpDraft): SensitiveDetectionResult | null {
  const parts: string[] = [];

  if (draft.title) parts.push(draft.title);
  if (draft.steps?.length) parts.push(...draft.steps);
  if (draft.expected) parts.push(draft.expected);
  if (draft.actual) parts.push(draft.actual);
  if (draft.problem) parts.push(draft.problem);
  if (draft.proposed) parts.push(draft.proposed);

  const combined = parts.join(' ');
  return detectSensitiveInput(combined);
}
