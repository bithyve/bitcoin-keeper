## ADDED Requirements

### Requirement: Wallets tab header shows Testnet indicator when Testnet is active
When the global Network Type is Testnet, the Wallets tab header title SHALL display `Wallets (Testnet)`. When the global Network Type is Mainnet, the title SHALL display `Wallets` with no suffix.

#### Scenario: Wallets tab in Testnet mode
- **WHEN** the user opens the Wallets tab and `bitcoinNetworkType` is `TESTNET`
- **THEN** the `HomeScreenHeader` title shows `Wallets (Testnet)`

#### Scenario: Wallets tab in Mainnet mode
- **WHEN** the user opens the Wallets tab and `bitcoinNetworkType` is `MAINNET`
- **THEN** the `HomeScreenHeader` title shows `Wallets` with no `(Testnet)` suffix

#### Scenario: Wallets tab title updates when network changes without restart
- **WHEN** the user is on the Wallets tab and changes Network Type from Testnet to Mainnet
- **THEN** the header title updates immediately to `Wallets` without requiring a restart or navigation change

### Requirement: Keys tab header shows Testnet indicator when Testnet is active
When the global Network Type is Testnet, the Keys tab header title SHALL display `Keys (Testnet)`. When the global Network Type is Mainnet, the title SHALL display `Keys` with no suffix.

#### Scenario: Keys tab in Testnet mode
- **WHEN** the user opens the Keys tab and `bitcoinNetworkType` is `TESTNET`
- **THEN** the `HomeScreenHeader` title shows `Keys (Testnet)`

#### Scenario: Keys tab in Mainnet mode
- **WHEN** the user opens the Keys tab and `bitcoinNetworkType` is `MAINNET`
- **THEN** the `HomeScreenHeader` title shows `Keys` with no `(Testnet)` suffix

#### Scenario: Keys tab title updates when network changes without restart
- **WHEN** the user is on the Keys tab and changes Network Type from Mainnet to Testnet
- **THEN** the header title updates immediately to `Keys (Testnet)` without requiring a restart or navigation change

### Requirement: Receive Bitcoin screen header shows Testnet indicator when Testnet is active
When the global Network Type is Testnet, the Receive Bitcoin screen header title SHALL display `Receive Bitcoin (Testnet)`. When Mainnet, it SHALL display `Receive Bitcoin` with no suffix.

#### Scenario: Receive Bitcoin screen in Testnet mode
- **WHEN** the user opens the Receive Bitcoin screen and `bitcoinNetworkType` is `TESTNET`
- **THEN** the `WalletHeader` title shows `Receive Bitcoin (Testnet)`

#### Scenario: Receive Bitcoin screen in Mainnet mode
- **WHEN** the user opens the Receive Bitcoin screen and `bitcoinNetworkType` is `MAINNET`
- **THEN** the `WalletHeader` title shows `Receive Bitcoin` with no `(Testnet)` suffix

#### Scenario: QR code and address layout are unaffected
- **WHEN** the Testnet indicator is shown on the Receive Bitcoin screen
- **THEN** the QR code, receive address, and all other UI elements remain in their existing positions

### Requirement: Send Confirmation screen header shows Testnet indicator when Testnet is active
When the global Network Type is Testnet, the Send Confirmation screen header title SHALL display the existing title with `(Testnet)` appended. When Mainnet, the existing title SHALL be shown with no suffix.

#### Scenario: Send Confirmation screen in Testnet mode
- **WHEN** the user reaches the Send Confirmation screen and `bitcoinNetworkType` is `TESTNET`
- **THEN** the `WalletHeader` title shows the existing confirmation title with ` (Testnet)` appended

#### Scenario: Send Confirmation screen in Mainnet mode
- **WHEN** the user reaches the Send Confirmation screen and `bitcoinNetworkType` is `MAINNET`
- **THEN** the `WalletHeader` title shows the existing confirmation title with no `(Testnet)` suffix

#### Scenario: Transaction details are unaffected
- **WHEN** the Testnet indicator is shown on the Send Confirmation screen
- **THEN** all transaction fee details, amounts, recipient addresses, and action buttons remain unaffected

### Requirement: Testnet indicator is non-interactive
The Testnet indicator text SHALL NOT respond to tap gestures. Tapping the header area where the indicator appears SHALL NOT navigate to Network Type settings or trigger any action.

#### Scenario: Tap on indicator has no effect
- **WHEN** the user taps on the `(Testnet)` portion of a header title
- **THEN** no navigation occurs and no modal, bottom sheet, or toast is triggered

### Requirement: No Mainnet indicator is shown
In Mainnet mode, no network indicator SHALL appear on any screen.

#### Scenario: No indicator in Mainnet mode
- **WHEN** `bitcoinNetworkType` is `MAINNET`
- **THEN** none of the four affected screen headers show any network suffix or indicator
