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
