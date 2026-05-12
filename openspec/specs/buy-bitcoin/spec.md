# Buy-Bitcoin Specification

## Status: Deprecated

## Purpose

Buy/Sell/Swap/Acquire is no longer part of Bitcoin Keeper. This spec is retained
only as a historical reference if needed and must not be used as an active product
source for coding agents.

## Removed from Active Scope

- Acquire tab
- Buy Bitcoin
- BTC to USDT swap
- USDT to BTC swap
- Ramp buy/sell flow
- Ramp Buy USDT
- Exchange/on-ramp provider routing
- Price chart requirements tied to buy/sell/swap flows
- Buy/sell/swap history

## Acceptance Criteria

- This spec is marked deprecated.
- No active Keeper OpenSpec package assumes Buy/Sell/Swap/Acquire exists.
- No active wallet screen requires Acquire tab behavior.
- No Ramp buy/sell flow remains in active Keeper specs.

---

## Historical Content (Archived — Do Not Implement)

The requirements below are preserved as historical reference only. They MUST NOT
be used as active implementation guidance.

---

### Requirement: Price and Market Data Display

The app MUST display the current BTC price in the user's selected fiat currency and the current USDT price on the Acquire tab. The app MUST also render a 24-hour BTC price chart alongside the percentage and absolute value change over the same period. Price and chart data MUST be fetched from the BitHyve relay on every visit to the Acquire tab.

#### Scenario: Acquire tab loads with current prices

- GIVEN the user is authenticated and the device has network access
- WHEN the user opens the Acquire tab on the Home screen
- THEN the current BTC price in the selected fiat currency is displayed
- AND the 24-hour price change (amount and percentage) is shown with a colour indicating gain or loss
- AND a 24-hour BTC price chart is rendered
- AND the current USDT price in the selected fiat currency is displayed

#### Scenario: Price data fetch fails

- GIVEN the device has no network access or the relay is unreachable
- WHEN the user opens the Acquire tab
- THEN the app displays an error state in place of price and chart data
- AND the Buy and Sell actions remain reachable once a network connection is restored

---

### Requirement: Buy Bitcoin Entry Points

The app MUST provide an entry point to purchase Bitcoin from both the Home screen Acquire tab and from individual wallet and vault detail screens. Tapping the buy action from a wallet or vault detail screen MUST pass the relevant wallet directly to the purchase flow without requiring a separate wallet selection step.

#### Scenario: Open buy flow from Acquire tab

- GIVEN the user is on the Home screen Acquire tab
- WHEN the user taps the Buy action on the Bitcoin card
- THEN a wallet selection modal appears listing all available Bitcoin wallets and vaults

#### Scenario: Open buy flow from wallet detail screen

- GIVEN the user has opened a Bitcoin wallet's detail screen
- WHEN the user taps the Buy button in the wallet action cards
- THEN the app navigates directly to the purchase confirmation screen with the current wallet's receive address pre-filled, skipping wallet selection

#### Scenario: Open buy flow from vault detail screen

- GIVEN the user has opened a vault's detail screen
- WHEN the user taps the Buy button in the vault action cards
- THEN the app navigates directly to the purchase confirmation screen with the vault's current receive address pre-filled

#### Scenario: Buy tapped with no wallet available

- GIVEN the user is on the Acquire tab and has no Bitcoin wallets or vaults
- WHEN the user taps the Buy action on the Bitcoin card
- THEN the app displays an error message instructing the user to create a wallet before proceeding
- AND the wallet selection modal is not shown

---

### Requirement: Wallet Selection for Purchase

When the buy flow is initiated from the Acquire tab, the app MUST present a wallet selection modal listing all available Bitcoin wallets and vaults. The user MUST select one wallet before the purchase can proceed. Each list item MUST display the wallet's name and an icon that visually distinguishes a wallet from a vault.

#### Scenario: User selects a wallet and proceeds

- GIVEN the wallet selection modal is open with at least one wallet listed
- WHEN the user taps a wallet and then taps Proceed
- THEN the modal closes and the purchase confirmation screen opens with the selected wallet's receive address pre-filled

#### Scenario: Proceed is unavailable until a wallet is selected

- GIVEN the wallet selection modal is open
- WHEN no wallet has been tapped yet
- THEN the Proceed button is disabled or absent and the user cannot advance

---

### Requirement: Receive Address Pre-fill

The purchase confirmation screen MUST display the receiving wallet's current unused receive address before the user is redirected to the provider. The address MUST be shown in full so the user can verify it.

#### Scenario: Receive address is shown before redirect

- GIVEN the user has selected a wallet and reached the purchase confirmation screen
- WHEN the screen loads
- THEN the wallet's current receive address is displayed in full on the screen
- AND the Ramp Network branding is visible alongside a description of the provider

#### Scenario: User can verify address before proceeding

- GIVEN the purchase confirmation screen is visible with the receive address displayed
- WHEN the user reviews the screen
- THEN the full receive address is legible and not truncated beyond readability

---

### Requirement: Provider Redirect (Buy Bitcoin)

When the user taps Proceed on the purchase confirmation screen, the app MUST request a signed Ramp Network URL from the BitHyve relay, embedding the selected wallet's receive address, and MUST open that URL in the device's default external browser. The app MUST display a loading indicator while the URL is being fetched. On a URL fetch error, the app MUST show an error message and remain on the confirmation screen.

#### Scenario: Successful redirect to Ramp for purchase

- GIVEN the user is on the purchase confirmation screen with a receive address displayed
- WHEN the user taps Proceed
- THEN the app shows a loading indicator
- AND after the URL is fetched, the device's external browser opens the Ramp Network purchase page with the receive address pre-filled
- AND the app returns to the confirmation screen in the background

#### Scenario: URL fetch fails on Proceed

- GIVEN the user taps Proceed but the relay is unreachable
- WHEN the URL fetch request fails
- THEN the loading indicator disappears
- AND the app displays an error toast
- AND the user remains on the confirmation screen and may retry

---

### Requirement: Geographic Restriction (UK)

When the user's device is configured for GBP as the display currency or is detected as located in the United Kingdom, the app MUST NOT pre-fill the receive address in the Ramp purchase flow. Instead, the app MUST open the Ramp Network website directly without embedding a wallet address. The Buy button label MUST be rendered as "Get" rather than "Buy" in this context.

#### Scenario: UK user opens buy flow

- GIVEN the user's currency is set to GBP or the device reports the UK as the country
- WHEN the user taps the buy action and proceeds through the confirmation screen
- THEN the button and label on the Acquire card reads "Get" instead of "Buy"
- AND tapping Proceed opens the Ramp Network website in the external browser without a pre-filled address

#### Scenario: Non-UK user opens buy flow

- GIVEN the user's currency is not GBP and the device is not in the UK
- WHEN the user taps the buy action and proceeds
- THEN the wallet's receive address is embedded in the Ramp URL
- AND the Acquire card label reads "Buy"

---

### Requirement: BTC↔USDT Swap

The app MUST provide an in-app swap screen allowing the user to exchange Bitcoin for USDT or USDT for Bitcoin. The user MUST enter the amount to send, select the source coin (BTC or USDT), select a source wallet, and select a destination wallet. The app MUST fetch a real-time exchange rate quote from the swap provider and display the estimated output amount. The user MUST be able to choose between a floating rate and a fixed rate. The app MUST enforce the provider's minimum and maximum swap amounts and show a validation error if the entered amount is out of range.

#### Scenario: Successful BTC→USDT swap initiated

- GIVEN the user opens the Swap screen, selects BTC as the source coin and USDT as the destination coin
- WHEN the user enters a valid BTC amount, selects a source Bitcoin wallet, selects a destination USDT wallet, and taps Swap
- THEN the app fetches the exchange quote, creates a swap transaction with the provider, and navigates to the Swap Details screen
- AND the Swap Details screen shows the provider's BTC deposit address and the expected USDT output amount

#### Scenario: Amount below provider minimum

- GIVEN the user has entered an amount in the Swap screen
- WHEN the entered amount is below the provider's minimum allowed swap amount for the selected coin pair
- THEN the app displays an inline validation error showing the allowed minimum and maximum
- AND the Swap button remains disabled

#### Scenario: Fixed rate selected

- GIVEN the user is on the Swap screen
- WHEN the user checks the Fixed Rate option and enters a valid amount
- THEN the quoted output amount reflects a locked exchange rate
- AND the swap is submitted with the fixed rate identifier

#### Scenario: Source or destination wallet not selected

- GIVEN the user has entered a valid amount but has not selected both wallets
- WHEN the user taps Swap
- THEN the app displays an error message instructing the user to select both a source and a destination wallet
- AND no swap transaction is created

#### Scenario: Coin pair direction reversed

- GIVEN the user has BTC selected as source and USDT as destination
- WHEN the user taps the coin switch control next to either field
- THEN the source and destination coins are swapped
- AND both wallet selections are cleared so the user must re-select appropriate wallets for the new direction

---

### Requirement: Swap Details and Sending

After a swap transaction is created, the app MUST display a Swap Details screen showing the provider's deposit address, the deposit amount, and the expected output. For Bitcoin swaps, the app MUST initiate the standard Bitcoin send flow to dispatch funds to the deposit address. For USDT swaps, the app MUST initiate the USDT send flow. The app MUST validate that the source wallet has sufficient balance before proceeding.

#### Scenario: BTC swap send initiated from Swap Details

- GIVEN the Swap Details screen is open with a valid BTC deposit address and amount
- WHEN the user taps the send/proceed action
- THEN the app begins the Bitcoin send phase, calculates fees, and transitions to the transaction confirmation screen
- AND on confirmation, the transaction is broadcast and the swap status updates

#### Scenario: Insufficient balance for swap

- GIVEN the source wallet does not have enough confirmed balance to cover the swap deposit amount plus network fees
- WHEN the send phase is initiated
- THEN the app shows an insufficient balance error
- AND the user is not advanced to broadcast

---

### Requirement: Swap Transaction History

The app MUST persist all swap transactions locally and display them in a history list on the Swap screen. The list MUST show the three most recent swaps. A "View All" control MUST navigate to a full swap history screen. Each history entry MUST show the coin pair, amounts, and current status. The app MUST support navigating to a detail screen for any individual swap transaction.

#### Scenario: Swap history appears after transaction

- GIVEN the user has completed at least one swap
- WHEN the user returns to the Swap screen
- THEN the most recent swap is shown in the history section with its status and coin pair

#### Scenario: View all swap history

- GIVEN the swap history section shows up to three recent entries
- WHEN the user taps "View All"
- THEN the full swap history screen opens listing all swaps in reverse chronological order

#### Scenario: Swap detail shows current status

- GIVEN the full swap history screen is open
- WHEN the user taps a swap entry
- THEN the Swap Detail screen opens showing the status (Confirming, Processing, Success, Overdue, or Refund), coin logos, deposit amount, output amount, and timestamps

#### Scenario: No swap history yet

- GIVEN the user has not performed any swaps
- WHEN the user opens the Swap screen
- THEN the history section shows an empty state message and no list items

---

## Non-Goals

- This spec does not cover USDT wallet creation or management; that is owned by the `usdt` domain.
- This spec does not cover the internal Bitcoin PSBT signing flow used to dispatch funds during a swap; that is owned by the `send-and-receive` domain.
- This spec does not cover Ramp Network's internal purchase UI after the external browser is opened; that is third-party territory.
- This spec does not cover subscription-tier gating of purchase amounts or provider access; tier enforcement is owned by the `subscription` domain.
- This spec does not cover Bitcoin price-rate sourcing for fee display in send flows; exchange rate settings are owned by the `settings` domain.
- This spec does not define the provider contract, API keys, or relay-backend signing logic for the Ramp URL.
