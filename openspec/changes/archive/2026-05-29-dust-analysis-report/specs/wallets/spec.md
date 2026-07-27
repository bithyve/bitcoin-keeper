## ADDED Requirements

### Requirement: Dust Report entry point in Wallet Settings

Wallet Settings SHALL include a "Dust Report" row for every wallet. The row SHALL be wallet-specific and SHALL NOT appear in app-level settings. Tapping the row SHALL navigate to the Dust Report screen for that wallet.

#### Scenario: User opens Dust Report from Wallet Settings

- GIVEN the user is on the Wallet Settings screen for any wallet
- WHEN the user taps the "Dust Report" row
- THEN the Dust Report start screen opens for that wallet
- AND no other wallet's data is shown

#### Scenario: Dust Report row is present regardless of dust status

- GIVEN the user is on the Wallet Settings screen for a wallet that has no classified UTXOs
- WHEN the Wallet Settings screen renders
- THEN the Dust Report row is still visible and tappable

---

### Requirement: Dust Report entry point in Vault Settings

Vault Settings SHALL include a "Dust Report" row for every vault. The row SHALL be vault-specific and SHALL NOT appear in app-level settings. Tapping the row SHALL navigate to the Dust Report screen for that vault. The `useDustReport` hook SHALL resolve the entity by checking wallets first, then vaults, so a single hook call handles both entity types transparently.

#### Scenario: User opens Dust Report from Vault Settings

- GIVEN the user is on the Vault Settings screen for any vault
- WHEN the user taps the "Dust Report" row
- THEN the Dust Report start screen opens for that vault
- AND no other vault's or wallet's data is shown

#### Scenario: Dust Report row is present for all vault types

- GIVEN the user is on the Vault Settings screen for any vault type (single-sig, multisig, miniscript, collaborative)
- WHEN the Vault Settings screen renders
- THEN the Dust Report row is visible and tappable
