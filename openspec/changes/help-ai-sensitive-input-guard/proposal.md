## Why

The Ask Keeper AI chat feature must never transmit sensitive Bitcoin key material or seed words to the backend. The current frontend guard uses a single narrow regex (`seed phrase`, `mnemonic`, `xpriv`, `private key`, `passphrase`) that misses the most dangerous real-world inputs: pasted BIP39 mnemonics (12/24 words), actual extended key strings (`xpub`/`xprv`/`zprv` etc.), and WIF-encoded private keys. Additionally, the draft submission path to public GitHub issues has no scanning at all, making it the highest-risk leakage surface.

## What Changes

- **Replace** the bare `SENSITIVE_INPUT_PATTERN` regex in `HelpAiChat.tsx` with a call to a new dedicated utility `src/utils/helpAiSensitiveData.ts`
- **Add** cryptographic format detection: extended private keys (`xprv`/`yprv`/`zprv` + variants) and extended public keys (`xpub`/`ypub`/`zpub` + variants) only when they match the actual long base58 key format (not the word alone)
- **Add** WIF private key format detection (51–52 char base58 strings starting with `5`, `K`, `L`, or `c`)
- **Add** BIP39 mnemonic sequence detection: flag input containing 8 or more consecutive tokens that are all valid BIP39 words, using a pre-built `Set` from the full 2048-word English wordlist
- **Refine** keyword list: remove `passphrase` (too many false positives for legitimate questions), add `recovery phrase`, `backup phrase`, `secret phrase`, `secret key`
- **Add** draft scan gate in `submitDraftIssue()`: scan all draft fields before any API call; hard-block submission if sensitive data is detected and show a clear explanation
- **Add** unit tests for all detection categories, including true-positive mnemonic/key fixtures and natural-language false-negative cases

## Capabilities

### New Capabilities

- `help-ai-sensitive-input-guard`: Client-side detection and blocking of sensitive Bitcoin key material (BIP39 mnemonics, extended keys, WIF keys, keyword phrases) in both chat message sends and draft issue submissions, implemented as a standalone testable utility

### Modified Capabilities

- none

## Impact

- **Files modified**: `src/screens/HelpAi/HelpAiChat.tsx`, `src/utils/helpAiLinkPolicy.ts` (no change — pattern follows its conventions)
- **Files created**: `src/utils/helpAiSensitiveData.ts`, `src/constants/bip39WordSet.ts`, `tests/helpAiSensitiveData.test.ts`
- **Dependencies**: `bip39` (already in project — used in `bhr.ts`, `storage.ts`, `wallets/operations/utils.ts`); no new packages needed
- **Backend**: No backend changes. This is a pure frontend defence layer. Backend scanning is a separate concern.
- **Networks**: Applies to mainnet and testnet equally — both use BIP39 mnemonics and the same extended key formats
- **Hardware signers**: No impact
- **Subscription gating**: None — this guard applies to all users
- **Security impact**: Prevents seed phrases, private keys, and extended keys from leaving the device through the chat or GitHub issue submission paths

## Non-goals

- Real-time / on-change inline warning UI (send-time blocking only)
- Backend-side scanning or redaction (separate task)
- xpub soft-warning flow (xpub with full key format is hard-blocked, same as xprv)
- Scanning of AI reply content for sensitive data (AI responses are backend-controlled)
- Detection of wallet descriptors that do not contain embedded private key material
