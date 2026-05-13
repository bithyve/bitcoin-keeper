## ADDED Requirements

### Requirement: Server Key disabled on Testnet
When the app is operating on Testnet (`bitcoinNetworkType === NetworkType.TESTNET`), the Server Key signer card in the Software signer category SHALL be rendered in a disabled, non-interactive state. The card SHALL display "Not available on Testnet." as its subtext. No API call to the Signing Server SHALL be initiated.

#### Scenario: Server Key card disabled on Testnet
- **WHEN** the user opens the Software signer category in SigningDeviceList on Testnet
- **THEN** the Server Key card is visible but disabled (non-tappable, visually greyed)
- **THEN** the Server Key card subtext reads "Not available on Testnet."

#### Scenario: Server Key card enabled on Mainnet
- **WHEN** the user opens the Software signer category in SigningDeviceList on Mainnet
- **THEN** the Server Key card behaves exactly as it does today (existing behaviour unchanged)

### Requirement: Inheritance Key option disabled on Testnet
In the Enhanced Security modal (`EnhancedSecurityModal`), the Inheritance Key card SHALL be disabled and non-interactive on Testnet. The card subtext SHALL read "Not available on Testnet." instead of its normal description.

#### Scenario: Inheritance Key card disabled on Testnet
- **WHEN** the user opens the Enhanced Security modal on Testnet
- **THEN** the Inheritance Key card is visible but disabled
- **THEN** the Inheritance Key card subtext reads "Not available on Testnet."
- **THEN** tapping the card has no effect

#### Scenario: Inheritance Key card functional on Mainnet
- **WHEN** the user opens the Enhanced Security modal on Mainnet
- **THEN** the Inheritance Key card behaves as it does today

### Requirement: Emergency Key option disabled on Testnet
In the Enhanced Security modal, the Emergency Key card SHALL be disabled and non-interactive on Testnet. The card subtext SHALL read "Not available on Testnet."

#### Scenario: Emergency Key card disabled on Testnet
- **WHEN** the user opens the Enhanced Security modal on Testnet
- **THEN** the Emergency Key card is visible but disabled
- **THEN** the Emergency Key card subtext reads "Not available on Testnet."
- **THEN** tapping the card has no effect

#### Scenario: Emergency Key card functional on Mainnet
- **WHEN** the user opens the Enhanced Security modal on Mainnet
- **THEN** the Emergency Key card behaves as it does today

### Requirement: Wallet Timelock option disabled on Testnet
In the Enhanced Security modal, the Wallet Timelock card SHALL be disabled and non-interactive on Testnet. The card subtext SHALL read "Not available on Testnet."

#### Scenario: Wallet Timelock card disabled on Testnet
- **WHEN** the user opens the Enhanced Security modal on Testnet and has expanded advanced options
- **THEN** the Wallet Timelock card is visible but disabled
- **THEN** the Wallet Timelock card subtext reads "Not available on Testnet."
- **THEN** tapping the card has no effect

#### Scenario: Wallet Timelock card functional on Mainnet
- **WHEN** the user opens the Enhanced Security modal on Mainnet
- **THEN** the Wallet Timelock card behaves as it does today

### Requirement: Enhanced Security modal Save Changes button disabled on Testnet
When all Enhanced Security options (Inheritance Key, Emergency Key, Wallet Timelock) are unavailable due to Testnet, the "Save Changes" button in `EnhancedSecurityModal` SHALL be disabled.

#### Scenario: Save Changes disabled on Testnet
- **WHEN** the user opens the Enhanced Security modal on Testnet
- **THEN** the "Save Changes" button is disabled and non-interactive

#### Scenario: Save Changes enabled on Mainnet
- **WHEN** the user opens the Enhanced Security modal on Mainnet
- **THEN** the "Save Changes" button behaves as it does today

### Requirement: Inheritance Key CTA disabled in Inheritance Planning on Testnet
The CTA button in the Inheritance Key slide within the Inheritance Planning section (`AssistedKeys.tsx`) SHALL be disabled on Testnet. The user SHALL NOT be able to navigate from this screen into the Inheritance Key wallet creation flow on Testnet.

#### Scenario: CTA button inert on Testnet
- **WHEN** the user is on the Inheritance Key slide in Inheritance Planning on Testnet
- **THEN** the CTA button is disabled (non-tappable)
- **THEN** tapping the button has no effect and no navigation occurs

#### Scenario: CTA button functional on Mainnet
- **WHEN** the user is on the Inheritance Key slide in Inheritance Planning on Mainnet
- **THEN** the CTA button navigates to wallet creation as it does today
