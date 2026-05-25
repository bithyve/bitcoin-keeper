## Context

The Ask Keeper chat feature currently guards against sensitive data leakage with a single regex applied at send time in `HelpAiChat.tsx`:

```ts
const SENSITIVE_INPUT_PATTERN = /(seed\s*phrase|mnemonic|xpriv|private\s*key|passphrase)/i;
```

This misses the most dangerous real-world scenarios: a user pasting 12 or 24 BIP39 seed words (no trigger phrase present), pasting an actual extended key string like `xpub6FNxwLz...` or `xprv9s21ZrQ...` (the pattern only catches the label `xpriv`, not the key itself), and WIF-encoded raw private keys. Additionally, the draft submission flow to GitHub public issues has zero scanning — the highest-risk leakage path in the feature.

The `bip39` library is already a project dependency (used in `bhr.ts`, `storage.ts`, `wallets/operations/utils.ts`). The full 2048-word English wordlist is available from the attached `bip39.txt` file and can be shipped as a static constant with no new dependencies.

## Goals / Non-Goals

**Goals:**
- Block BIP39 mnemonic sequences (8+ consecutive BIP39 words) before they reach the backend
- Block actual extended private and public key strings (long base58 suffix, not just the label word)
- Block WIF-encoded private keys
- Block keyword phrases that signal the user is describing key material
- Scan all draft fields before GitHub issue submission and hard-block if sensitive data found
- Keep all detection synchronous and on-device; nothing leaves the device to perform the check

**Non-Goals:**
- Real-time / on-change scanning or inline warning UI (send-time only)
- Backend scanning (separate concern, separate task)
- Passphrase keyword blocking (removed — too many false positives for legitimate BIP39 passphrase questions)
- Scanning AI reply content (responses come from backend, controlled separately)
- Detecting wallet descriptors that contain only xpub material (covered by xpub key pattern)

## Decisions

### Decision 1: Dedicated utility file, not inline regex

**Choice**: Create `src/utils/helpAiSensitiveData.ts` exporting `detectSensitiveInput(text)` and `detectSensitiveInDraft(draft)`.

**Rationale**: The existing `helpAiLinkPolicy.ts` file establishes this exact pattern — security concerns as standalone, testable utilities. Keeping detection logic in the screen component makes it impossible to unit test without mounting the full component, and couples security logic to UI. A utility file can be imported from both `HelpAiChat.tsx` (chat send) and any future surface.

**Alternative considered**: Expand the inline regex. Rejected — a single regex cannot express the BIP39 word-sequence detection, and a growing monolithic pattern becomes unmaintainable and untestable.

---

### Decision 2: BIP39 word Set from a static constant, not runtime import

**Choice**: Create `src/constants/bip39WordSet.ts` — a file that exports `const BIP39_WORD_SET: Set<string>` built from the 2048-word English list embedded as a JS `Set` literal.

**Rationale**: The `bip39` library's `wordlists.english` array is available at runtime but requires importing the full `bip39` module into the utility. A static `Set<string>` constant is smaller, tree-shakeable, loads synchronously with zero async overhead, gives O(1) per-word lookup, and keeps the utility file side-effect-free. The wordlist never changes (it is a Bitcoin standard), so a static file is appropriate.

**Detection logic**: Tokenize input on whitespace → scan for the longest consecutive run where every token (lowercased) is in `BIP39_WORD_SET` → if run ≥ 8, flag as `mnemonic`.

**Threshold — why 8**: A 12-word mnemonic is the minimum valid BIP39 length. Using 8 consecutive words provides a safety margin that catches truncated pastes and partial mnemonics, while making accidental false positives on natural language essentially impossible. The probability that 8 consecutive ordinary English words are all from the 2048-word BIP39 list by chance is negligibly small.

**Alternative considered**: Use `bip39.validateMnemonic()` — only catches exactly 12 or 24 valid checksummed mnemonics. Rejected — misses partial pastes, mnemonics from other languages, and is too strict (a user pasting their words one by one could still leak many words before triggering).

---

### Decision 3: Extended key detection via prefix + minimum base58 length

**Choice**: Match `(xprv|yprv|zprv|Xprv|Yprv|Zprv|tprv|uprv|vprv)` OR `(xpub|ypub|zpub|Xpub|Ypub|Zpub|tpub|upub|vpub)` followed by `[1-9A-HJ-NP-Za-km-z]{100,}`.

**Rationale**: The words "xpub" or "xprv" alone are commonly used in support discussions ("How do I find my xpub?"). The actual key format is the 4-char prefix followed by ~107 base58 chars. Requiring 100+ base58 chars after the prefix ensures we only match actual key material, not documentation references. Both extended private and extended public keys are blocked — xpubs expose full transaction history and wallet structure.

**Alternative considered**: Match on the 4-char prefix alone (current `xpriv` keyword approach). Rejected — too many false positives and the current pattern doesn't even match the correct format (`xpriv` vs `xprv`).

---

### Decision 4: WIF detection via start character + length

**Choice**: Match `\b[5KLc][1-9A-HJ-NP-Za-km-z]{49,51}\b`.

- `5` = mainnet uncompressed WIF (51 chars total)
- `K` or `L` = mainnet compressed WIF (52 chars total)
- `c` = testnet WIF (52 chars total)

**Rationale**: WIF keys have a highly distinctive structure — a specific starting character plus a specific length in base58. The combination of start character and length range makes false positives extremely unlikely in a chat context.

**Risk**: The letter `c` starting a 50-52 char base58 string could theoretically appear in other contexts. Accepted — the probability in chat input is negligible and it's preferable to over-block than under-block on private key material.

---

### Decision 5: Draft scanning hard-blocks submission

**Choice**: In `submitDraftIssue()`, scan all draft string fields (concatenated: `title`, `steps` joined, `expected`, `actual`, `problem`, `proposed`) using `detectSensitiveInDraft()` before the first dispatch or API call. If detection returns a result, call `showToast()` with an explanation and return early — do not dispatch `setHelpAiDraftStatus('submitting')`.

**Rationale**: GitHub issues are permanent, public, and indexed. The draft is AI-generated from the conversation, but the conversation could have been partially blocked, leaving the AI to summarize context the user provided before the blocked message. The scan is cheap (synchronous, no network) and the cost of a false positive (user sees a toast, fixes draft by continuing chat) is far lower than the cost of leaking key material to a public GitHub issue.

---

### Decision 6: Refined keyword list

**Remove**: `passphrase` — blocks too many legitimate questions about BIP39 passphrase features on hardware signers.

**Keep / Add**:
- `seed phrase`, `recovery phrase`, `backup phrase`, `secret phrase`
- `mnemonic`
- `private key`, `secret key`, `privatekey`
- `xpriv` (the label, separate from the actual key format pattern)

These are labels that indicate the user is *describing* sensitive material even if they haven't pasted it yet.

## Risks / Trade-offs

**[BIP39 false positive on domain-specific terms]** → Some BIP39 words (`metal`, `member`, `network`, `normal`, etc.) are common English words. A user typing a very long technical paragraph could theoretically hit 8 consecutive BIP39 words. The threshold of 8 consecutive with the specific BIP39-only vocabulary makes this highly unlikely. If it does occur, the user sees a toast and can rephrase.

**[xpub blocking frustrates power users]** → A user asking about importing an xpub for watch-only wallet setup might paste their xpub key. They will be blocked. This is intentional — xpubs should be handled via dedicated import flows, not AI chat. The toast message should clearly explain and redirect them.

**[No real-time feedback]** → Users only learn their input is blocked at send time. This is acceptable for the initial implementation. Send-time is a hard gate; the UX cost is a toast rather than inline highlighting.

**[Draft can't be edited inline]** → If a draft is blocked, the user cannot edit the draft fields directly in the UI; they must cancel and continue the conversation to regenerate a clean draft. This is a known limitation of the current draft flow.

## Migration Plan

1. Create `src/constants/bip39WordSet.ts` from the 2048-word list
2. Create `src/utils/helpAiSensitiveData.ts` with detection functions
3. Write unit tests in `tests/helpAiSensitiveData.test.ts`
4. Update `HelpAiChat.tsx`: replace inline regex with `detectSensitiveInput`, add `detectSensitiveInDraft` call in `submitDraftIssue`
5. No migration needed — no stored data format changes, no Redux migration required

**Rollback**: All changes are frontend-only. Removing the new utility and reverting `HelpAiChat.tsx` to the previous regex restores the prior state. No data migration needed.

## Open Questions

None — all design questions resolved in the explore session prior to this proposal.
