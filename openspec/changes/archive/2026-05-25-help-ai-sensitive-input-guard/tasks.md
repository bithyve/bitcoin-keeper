## 1. BIP39 Word Set Constant

- [x] 1.1 Create `src/constants/bip39WordSet.ts` that exports `BIP39_WORD_SET: Set<string>` built from the full 2048-word English BIP39 wordlist (sourced from `bip39.txt`)

## 2. Sensitive Data Detection Utility

- [x] 2.1 Create `src/utils/helpAiSensitiveData.ts` and define the exported type: `SensitiveDetectionResult = { kind: 'mnemonic' | 'extended_private_key' | 'extended_public_key' | 'wif_key' | 'keyword'; message: string }`
- [x] 2.2 Implement `detectKeywords(text: string)` — case-insensitive match for: `seed phrase`, `recovery phrase`, `backup phrase`, `secret phrase`, `mnemonic`, `private key`, `privatekey`, `secret key`, `xpriv`
- [x] 2.3 Implement `detectExtendedKeys(text: string)` — regex match for extended private key prefixes (`xprv|yprv|zprv|Xprv|Yprv|Zprv|tprv|uprv|vprv`) followed by 100+ base58 chars; returns `kind: 'extended_private_key'`
- [x] 2.4 Implement extended public key detection in `detectExtendedKeys` — same pattern for `xpub|ypub|zpub|Xpub|Ypub|Zpub|tpub|upub|vpub` followed by 100+ base58 chars; returns `kind: 'extended_public_key'`
- [x] 2.5 Implement `detectWIF(text: string)` — regex match for `\b[5KLc][1-9A-HJ-NP-Za-km-z]{49,51}\b`; returns `kind: 'wif_key'`
- [x] 2.6 Implement `detectMnemonic(text: string)` using `BIP39_WORD_SET` — tokenize input on whitespace, scan for longest consecutive run of tokens all found in the set, return `kind: 'mnemonic'` if run ≥ 8
- [x] 2.7 Implement exported `detectSensitiveInput(text: string): SensitiveDetectionResult | null` — calls each detector in priority order (extended keys → WIF → mnemonic → keywords) and returns first match or `null`
- [x] 2.8 Implement exported `detectSensitiveInDraft(draft: HelpDraft): SensitiveDetectionResult | null` — concatenates all draft string fields (`title`, each entry in `steps`, `expected`, `actual`, `problem`, `proposed`) separated by spaces and calls `detectSensitiveInput` on the result

## 3. Unit Tests

- [x] 3.1 Create `tests/helpAiSensitiveData.test.ts` and write tests for `detectSensitiveInput`:
  - Returns `kind: 'mnemonic'` for a valid 12-word BIP39 mnemonic
  - Returns `kind: 'mnemonic'` for a valid 24-word BIP39 mnemonic
  - Returns `kind: 'mnemonic'` for exactly 8 consecutive BIP39 words
  - Returns `null` for 7 consecutive BIP39 words (below threshold)
  - Returns `null` for a clean benign support question
- [x] 3.2 Write tests for extended key detection:
  - Returns `kind: 'extended_private_key'` for a full `xprv...` key string
  - Returns `kind: 'extended_private_key'` for `zprv...` and `tprv...` variants
  - Returns `kind: 'extended_public_key'` for a full `xpub...` key string
  - Returns `null` for the word "xpub" alone (no long base58 suffix)
  - Returns `null` for the word "xprv" alone
- [x] 3.3 Write tests for WIF detection:
  - Returns `kind: 'wif_key'` for a WIF key starting with `K`
  - Returns `kind: 'wif_key'` for a WIF key starting with `5`
- [x] 3.4 Write tests for keyword detection:
  - Returns `kind: 'keyword'` for messages containing `seed phrase`, `recovery phrase`, `mnemonic`, `private key`
  - Returns `null` for a message containing only the word `passphrase` (no other sensitive pattern)
- [x] 3.5 Write tests for `detectSensitiveInDraft`:
  - Returns a result when the `title` field contains a keyword phrase
  - Returns a result when a `steps` entry contains a BIP39 mnemonic sequence
  - Returns `null` for a clean draft with no sensitive content

## 4. HelpAiChat Integration

- [x] 4.1 In `HelpAiChat.tsx`: remove the `SENSITIVE_INPUT_PATTERN` constant and its import
- [x] 4.2 Import `detectSensitiveInput` from `src/utils/helpAiSensitiveData`
- [x] 4.3 In `sendToChat()`: replace the `SENSITIVE_INPUT_PATTERN.test(text)` guard with `detectSensitiveInput(text.trim())`, keeping the same blocking behavior (return early, show toast using `result.message`)
- [x] 4.4 Import `detectSensitiveInDraft` from `src/utils/helpAiSensitiveData`
- [x] 4.5 In `submitDraftIssue()`: add a `detectSensitiveInDraft(draft)` call as the first check after the null guard; if a result is returned, call `showToast(result.message)` and return early without dispatching `setHelpAiDraftStatus('submitting')`
