## ADDED Requirements

### Requirement: Block BIP39 mnemonic sequences in chat input
The system SHALL detect and block any chat message that contains 8 or more consecutive whitespace-separated tokens where every token is a valid BIP39 English word, preventing seed phrases from reaching the backend.

#### Scenario: User pastes a 12-word seed phrase
- **WHEN** the user attempts to send a message containing 12 consecutive BIP39 words (e.g. "abandon ability able about above absent absorb abstract absurd abuse access accident")
- **THEN** the message MUST NOT be transmitted to the backend
- **AND** a toast message SHALL be shown informing the user that seed phrase content was detected

#### Scenario: User pastes a 24-word seed phrase
- **WHEN** the user attempts to send a message containing 24 consecutive BIP39 words
- **THEN** the message MUST NOT be transmitted to the backend
- **AND** a toast message SHALL be shown

#### Scenario: User pastes 8 consecutive BIP39 words embedded in a sentence
- **WHEN** the user sends a message where at least 8 consecutive tokens are all valid BIP39 words
- **THEN** the message MUST NOT be transmitted to the backend

#### Scenario: Legitimate message with incidental BIP39 words below threshold
- **WHEN** the user sends a message containing fewer than 8 consecutive BIP39 words (e.g. "I need help with my wallet")
- **THEN** the message SHALL be transmitted normally to the backend

---

### Requirement: Block actual extended key strings in chat input
The system SHALL detect and block any chat message containing a string that matches an extended private or extended public key format — defined as one of the known 4-character key prefixes (`xprv`, `yprv`, `zprv`, `Xprv`, `Yprv`, `Zprv`, `tprv`, `uprv`, `vprv`, `xpub`, `ypub`, `zpub`, `Xpub`, `Ypub`, `Zpub`, `tpub`, `upub`, `vpub`) immediately followed by 100 or more base58 characters.

#### Scenario: User pastes an xprv extended private key
- **WHEN** the user attempts to send a message containing a string like `xprv9s21ZrQH143K...` (prefix + 100+ base58 chars)
- **THEN** the message MUST NOT be transmitted to the backend
- **AND** a toast message SHALL be shown

#### Scenario: User pastes an xpub extended public key
- **WHEN** the user attempts to send a message containing a string like `xpub6FNxwLzfLRiw...` (prefix + 100+ base58 chars)
- **THEN** the message MUST NOT be transmitted to the backend
- **AND** a toast message SHALL be shown

#### Scenario: User writes the word "xpub" without an actual key
- **WHEN** the user sends a message like "How do I find my xpub?" without a long base58 suffix
- **THEN** the message SHALL be transmitted normally
- **AND** no sensitive-data block SHALL trigger

#### Scenario: User writes the word "xprv" without an actual key
- **WHEN** the user sends a message like "I read about xprv in the docs"
- **THEN** the message SHALL be transmitted normally

---

### Requirement: Block WIF-encoded private keys in chat input
The system SHALL detect and block any chat message containing a string that matches the WIF private key format: a base58 string of 50–52 characters starting with `5`, `K`, `L`, or `c`.

#### Scenario: User pastes a WIF mainnet compressed private key
- **WHEN** the user attempts to send a message containing a WIF key starting with `K` or `L` followed by 51 base58 chars
- **THEN** the message MUST NOT be transmitted to the backend
- **AND** a toast message SHALL be shown

#### Scenario: User pastes a WIF mainnet uncompressed private key
- **WHEN** the user attempts to send a message containing a WIF key starting with `5` followed by 50 base58 chars
- **THEN** the message MUST NOT be transmitted to the backend

---

### Requirement: Block keyword phrases that describe sensitive key material
The system SHALL detect and block any chat message containing any of the following case-insensitive phrases: `seed phrase`, `recovery phrase`, `backup phrase`, `secret phrase`, `mnemonic`, `private key`, `privatekey`, `secret key`, `xpriv`.

#### Scenario: User types "my seed phrase is"
- **WHEN** the user attempts to send a message containing the phrase "seed phrase"
- **THEN** the message MUST NOT be transmitted to the backend
- **AND** a toast message SHALL be shown

#### Scenario: User asks about BIP39 passphrase (not blocked)
- **WHEN** the user sends a message containing the word "passphrase" without any other sensitive pattern
- **THEN** the message SHALL be transmitted normally
- **AND** no sensitive-data block SHALL trigger

---

### Requirement: Scan draft fields before GitHub issue submission
The system SHALL run sensitive data detection across all fields of a bug or feature draft (`title`, `steps`, `expected`, `actual`, `problem`, `proposed`) before transmitting the draft to the backend for GitHub issue creation. If any sensitive data is detected, submission SHALL be hard-blocked.

#### Scenario: Draft title contains a seed phrase keyword
- **WHEN** the user attempts to confirm submission of a draft whose `title` field contains a sensitive keyword (e.g. "Issue with my seed phrase")
- **THEN** the draft MUST NOT be transmitted to the backend
- **AND** a toast message SHALL explain that sensitive content was found in the draft
- **AND** `draftStatus` SHALL NOT be changed to `submitting`

#### Scenario: Draft steps contain a BIP39 mnemonic sequence
- **WHEN** the user attempts to submit a draft whose `steps` array contains 8 or more consecutive BIP39 words across a single step entry
- **THEN** the draft MUST NOT be transmitted
- **AND** a toast message SHALL be shown

#### Scenario: Clean draft is submitted normally
- **WHEN** the user submits a draft that contains no sensitive data patterns
- **THEN** the draft SHALL be transmitted to the backend normally and the existing submission flow SHALL proceed unchanged

---

### Requirement: Provide a dedicated testable sensitive-data detection utility
The system SHALL implement sensitive data detection in a standalone utility module (`src/utils/helpAiSensitiveData.ts`) that is independent of any React component, enabling unit testing of all detection categories without mounting UI.

#### Scenario: Utility detects mnemonic in isolation
- **WHEN** `detectSensitiveInput` is called with a string of 8+ consecutive BIP39 words
- **THEN** it SHALL return a result with `kind: 'mnemonic'`

#### Scenario: Utility detects extended private key in isolation
- **WHEN** `detectSensitiveInput` is called with a string containing an xprv key
- **THEN** it SHALL return a result with `kind: 'extended_private_key'`

#### Scenario: Utility returns null for clean input
- **WHEN** `detectSensitiveInput` is called with a benign support question
- **THEN** it SHALL return `null`
