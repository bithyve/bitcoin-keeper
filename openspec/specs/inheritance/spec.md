# Inheritance Specification

## Purpose

The inheritance domain owns all features related to Bitcoin estate planning in Bitcoin Keeper — Miniscript vaults with timelocked spending paths, inheritance and emergency key management, initial timelock configuration and reset flows, vault migration triggered by timelock changes, printable PDF planning documents, and the advisor discovery screen. It provides the tools a user needs to ensure their bitcoin can be recovered by designated heirs or trusted parties if the primary keyholder becomes unavailable.

---

## Requirements

### Requirement: Inheritance Vault Creation

The app MUST allow a user to create a Miniscript vault that includes an Inheritance Key (reserve key) whose co-signing rights activate only after a user-configured initial timelock period elapses. The vault MUST require at least a 2-of-n primary quorum. A single-key vault MUST support an Inheritance Key but MUST NOT support an Emergency Key.

The user MUST explicitly accept a terms acknowledgement before the inheritance vault is finalised. The app MUST display a warning about the irreversibility of the timelock commitment at the point of acceptance.

The app MUST retrieve the current Bitcoin block height (or median time past) from the network before finalising the vault, and MUST surface an error and prevent creation if the chain data cannot be fetched.

#### Scenario: Create 2-of-3 vault with inheritance key and initial timelock

- GIVEN the user has a 2-of-3 multisig vault configuration in progress
- AND the user navigates to add an Inheritance Key
- WHEN the user selects an initial timelock duration (e.g. 6 months) and accepts the terms acknowledgement
- AND the user selects a signing key to serve as the Inheritance Key and sets its activation timelock (e.g. 1 year)
- AND the user confirms vault creation
- THEN a Miniscript vault of type INHERITANCE is created with the primary 2-of-3 quorum
- AND the Inheritance Key becomes co-eligible to sign only after the initial timelock plus the inheritance key's own timelock have elapsed
- AND the vault appears on the home screen with a confirmed balance of 0

#### Scenario: User does not accept terms — vault not created

- GIVEN the user has selected an initial timelock duration on the timelock selection screen
- WHEN the user attempts to proceed without checking the terms acceptance checkbox
- THEN the confirm button remains disabled and the vault is not created

#### Scenario: Chain data unavailable during vault creation

- GIVEN the app cannot reach any configured Electrum node to fetch the current block height
- WHEN the user attempts to confirm inheritance vault creation
- THEN the app surfaces an error informing the user that current chain data could not be fetched
- AND the vault is not created until the data can be retrieved

---

### Requirement: Initial Timelock Configuration

The app MUST allow the user to select an initial timelock duration — the waiting period that must elapse before any timelock-activated spending paths (Inheritance Key or Emergency Key) become valid. The available durations are 3 months, 6 months, 9 months, and 12 months.

The selected initial timelock MUST be encoded into the vault's Miniscript spending conditions at creation time and MUST be immutable without a full vault migration (see Requirement: Timelock Reset).

#### Scenario: User selects initial timelock of 6 months

- GIVEN the user is creating a new Miniscript vault with an Inheritance Key
- WHEN the user opens the activation time selector and chooses "6 months"
- THEN the vault is configured so that no inheritance or emergency spending path can be exercised until at least 6 months worth of Bitcoin blocks have been mined after the vault's creation block

#### Scenario: Initial timelock defaults to 6 months when not changed

- GIVEN the user navigates to the initial timelock selection screen
- WHEN the user does not change the default option and proceeds
- THEN the vault is created with a 6-month initial timelock

---

### Requirement: Inheritance Key (Reserve Key)

The app MUST allow the user to designate one or more Inheritance Keys on a Miniscript vault. An Inheritance Key's signing rights activate after the initial timelock plus the key's own individual timelock have both elapsed, expanding the effective quorum so the Inheritance Key can participate in spending.

The individual timelock for each Inheritance Key MUST be configurable by the user and MUST be selected from durations ranging from 6 months to 5 years (in 6-month increments), defaulting to 1 year.

The app MUST prevent the same physical signing key (identified by master fingerprint) from appearing in both the primary quorum and as an Inheritance Key.

#### Scenario: Inheritance Key activates after combined timelock

- GIVEN a Miniscript vault with a 6-month initial timelock and an Inheritance Key set to activate 1 year after the initial timelock
- WHEN the combined 18-month period has elapsed (enough Bitcoin blocks mined)
- THEN the Inheritance Key can be combined with the primary keys to satisfy an alternative spending path
- AND funds can be spent using fewer primary keys supplemented by the Inheritance Key

#### Scenario: Inheritance Key cannot use same fingerprint as primary key

- GIVEN the user is adding an Inheritance Key to a Miniscript vault
- WHEN the user selects a signing device that is already part of the primary quorum
- THEN the app prevents that selection and displays an error indicating the key is already in use as a primary signer

---

### Requirement: Emergency Key

The app MUST allow the user to designate one or more Emergency Keys on a Miniscript vault when the primary quorum threshold m is 2 or greater. An Emergency Key provides a unilateral (single-key) spending path that becomes valid after the initial timelock plus the Emergency Key's own timelock have elapsed.

The individual timelock for each Emergency Key MUST be configurable from durations ranging from 1 year to 5 years (in 6-month increments), defaulting to 3 years.

The app MUST prevent adding an Emergency Key to any vault where the primary quorum threshold is 1 (a 1-of-n configuration), and MUST prevent adding an Emergency Key to a single-key vault.

#### Scenario: Emergency key provides unilateral spending after timelock

- GIVEN a 2-of-3 Miniscript vault with an Emergency Key set to activate after 3 years total elapsed time
- WHEN the 3-year period has elapsed
- THEN the Emergency Key holder can spend vault funds unilaterally, without any other primary keys
- AND the app indicates the emergency spending path is now available when the user initiates a send

#### Scenario: Emergency Key rejected on 1-of-n or single-key vault

- GIVEN the user is configuring a vault with a primary threshold of 1
- WHEN the user attempts to add an Emergency Key
- THEN the app displays an error explaining that Emergency Keys are not permitted on vaults with a signing threshold of 1
- AND the Emergency Key is not added

---

### Requirement: Timelock Mechanism

The app MUST support two timelock encoding mechanisms depending on the network: block-height-based timelocks (using OP_CHECKLOCKTIMEVERIFY against the current block height) and timestamp-based timelocks (using median-time-past). On mainnet, block-height-based timelocks are used; on testnet, either may be used.

The app MUST fetch the current block height or median time past from the network when determining whether a timelocked spending path is currently active. If network data cannot be retrieved, the app MUST surface an error and MUST NOT allow a timelocked spending path to be selected as available.

#### Scenario: Spending path not yet available

- GIVEN a Miniscript vault where the Inheritance Key's combined timelock has not yet elapsed
- WHEN the user initiates a send from that vault
- THEN only the primary quorum spending path is presented as available
- AND the Inheritance Key spending path is shown as locked with an estimated unlock time

#### Scenario: Spending path active after timelock elapsed

- GIVEN a Miniscript vault where the combined timelock for the Inheritance Key has elapsed
- WHEN the user initiates a send and the app successfully fetches the current block height
- THEN the Inheritance Key spending path is presented as an available option alongside the primary quorum path

---

### Requirement: Timelock Reset

The current primary keyholder MUST be able to reset any timelock-activated spending path (initial timelock, Inheritance Key timelocks, or Emergency Key timelocks) to a new duration before the timelock expires. Resetting a timelock MUST trigger a vault migration, creating a new Miniscript vault with updated timelock parameters and transferring the designation.

The app MUST require the current block height or median time past to be fetched successfully before a timelock reset can be submitted. If chain data is unavailable, the app MUST display an error and prevent the reset.

If the vault also has Inheritance Keys, resetting the initial timelock MUST be followed by the Inheritance Key reset step. If the vault also has Emergency Keys, resetting the initial timelock or Inheritance Keys MUST be followed by the Emergency Key reset step.

#### Scenario: Successful initial timelock reset

- GIVEN a Miniscript vault with a 6-month initial timelock and an Inheritance Key
- WHEN the user navigates to reset the initial timelock, selects a new duration (e.g. 9 months), and the app successfully fetches the current block height
- THEN the app navigates to the Inheritance Key reset screen to update its timelock
- AND upon final confirmation, a new vault is created via migration with the updated timelocks
- AND the original vault is archived

#### Scenario: Initial timelock reset blocked by missing chain data

- GIVEN the app cannot reach the network to fetch the current block height
- WHEN the user attempts to confirm a timelock reset
- THEN the app surfaces an error indicating chain data could not be retrieved
- AND the reset is not applied

#### Scenario: Successful Emergency Key timelock reset

- GIVEN a Miniscript vault with one or more Emergency Keys
- WHEN the user navigates to reset each Emergency Key's activation duration, selects a new timelock for each, and confirms
- THEN a new vault is created via migration with the updated Emergency Key timelocks
- AND the original vault is archived
- AND the user is redirected to the new vault details screen

---

### Requirement: Inheritance Planning Tools

The app MUST provide an Inheritance Planning section containing a set of educational and documentation tools to help the user prepare their estate plan. Access to specific tools is gated by subscription tier.

The following tools MUST be available to users on the Diamond Hands tier (L3) and above:
- **Recovery Phrase Template** — a printable PDF template for recording a seed phrase.
- **Trusted Contacts Template** — a printable PDF for recording trusted contacts.
- **Additional Signer Details Template** — a printable PDF for documenting extra signing key information.

The following tools MUST be available to users on the Hodler tier (L2) and above:
- **Recovery Instructions** — a printable PDF containing step-by-step wallet recovery guidance.
- **Letter of Attorney** — a printable PDF legal template for designating a representative.
- **Inheritance Tips** — an educational tips carousel about inheritance planning best practices.

The app MUST display an upgrade prompt when a user on a lower tier attempts to access a gated tool.

Each tool card MUST display the last time the user accessed that tool.

#### Scenario: L3 user downloads Recovery Phrase Template

- GIVEN the user is subscribed to the Diamond Hands (L3) plan or above
- WHEN the user opens the Inheritance Planning section and taps Recovery Phrase Template
- THEN the app generates a PDF template and navigates to the PDF preview screen
- AND the user can download or share the PDF from the preview screen

#### Scenario: L2 user accesses Letter of Attorney

- GIVEN the user is subscribed to the Hodler (L2) plan or above
- WHEN the user taps Letter of Attorney in the Inheritance Planning section
- THEN the app prompts for PIN or biometric authentication before generating the PDF
- AND upon successful authentication the PDF is generated and the preview screen is shown

#### Scenario: Free-tier user sees upgrade prompt for gated tool

- GIVEN the user is on the Pleb (L1, free) plan
- WHEN the user opens the Inheritance Planning section
- THEN the tools gated to L2 and L3 are displayed as disabled
- AND an upgrade subscription banner is shown above the gated items

---

### Requirement: PDF Generation and Preview

The app MUST generate PDF documents for each supported inheritance planning template. Each PDF MUST be viewable in an in-app preview screen and MUST be downloadable or shareable from that screen.

On Android, the app MUST open the PDF directly via the system's PDF viewer action. On iOS, the app MUST open the system share sheet to allow the user to save or share the PDF.

#### Scenario: Download PDF on Android

- GIVEN the user is on Android and has generated a Recovery Instructions PDF
- WHEN the user taps the download button on the PDF preview screen
- THEN the system PDF viewer intent is launched with the generated file

#### Scenario: Share PDF on iOS

- GIVEN the user is on iOS and has generated a Letter of Attorney PDF
- WHEN the user taps the download button on the PDF preview screen
- THEN the iOS share sheet opens, allowing the user to save to Files, AirDrop, or another destination

---

### Requirement: Letter of Attorney Authentication Gate

The app MUST require successful PIN or biometric authentication before generating the Letter of Attorney PDF, because it contains sensitive signing key fingerprint information.

#### Scenario: Authentication required before PDF generation

- GIVEN the user is on L2 or above and taps Letter of Attorney
- WHEN the passcode verification modal appears and the user successfully authenticates with PIN or biometrics
- THEN the PDF is generated and the preview screen is shown

#### Scenario: Authentication failure — PDF not generated

- GIVEN the authentication modal is shown for the Letter of Attorney
- WHEN the user cancels or fails authentication
- THEN the PDF is not generated and the user remains on the Letter of Attorney screen

---

### Requirement: Assisted Keys Educational Slider

The app SHOULD present a guided, paginated slider explaining what an Inheritance Key is, how it works, and when it activates. The slider MUST include a direct call-to-action that allows the user to initiate an inheritance vault setup (with a suggested 2-of-3 scheme) from within the slider.

#### Scenario: User proceeds to vault setup from slider

- GIVEN the user is viewing the Assisted Keys educational slider
- WHEN the user reaches the Inheritance Key slide and taps the setup call-to-action
- THEN the app navigates to the new vault creation flow pre-configured with a 2-of-3 scheme and the inheritance key option enabled

---

### Requirement: Inheritance Tips Educational Content

The app MUST provide an Inheritance Tips screen (available to L2 and above) containing a multi-slide educational carousel with at least four tips covering: documenting multi-key setups, educating heirs, selecting a knowledgeable executor, and scheduling regular estate plan reviews.

#### Scenario: Tip carousel displayed to eligible user

- GIVEN the user is on the Hodler (L2) plan or above
- WHEN the user opens Inheritance Tips
- THEN the carousel shows at least four tips, each with a title, illustration, and description

---

### Requirement: Safe Keeping and Secure Usage Tips

The app MUST provide two always-accessible tip sections (no subscription gating): Secure Usage Tips and Safe Keeping Tips. These sections MUST be reachable from the Key Security area of the Inheritance Planning section.

#### Scenario: Free-tier user accesses Secure Usage Tips

- GIVEN the user is on the Pleb (L1) plan
- WHEN the user opens the Key Security section and taps Secure Usage Tips
- THEN the tips content is displayed without an upgrade prompt

---

### Requirement: Advisor Discovery

The app MAY provide an advisor directory allowing the user to browse and connect with vetted Bitcoin consultants and estate-planning advisors. The directory MUST be searchable by advisor name. Each advisor listing MUST display the advisor's name, expertise areas, languages, timezone, experience, and a link to book a consultation session.

The app MUST gracefully handle the case where no advisors are available and navigate back with an error message.

#### Scenario: User finds and connects with an advisor

- GIVEN the advisor directory is populated with at least one advisor
- WHEN the user opens the Advisors screen and searches for an advisor by name
- THEN matching advisors are displayed with their details
- AND tapping an advisor's booking link opens the external booking page

#### Scenario: User views advisor expertise and availability

- GIVEN the user opens an advisor's detail page
- WHEN the detail page loads
- THEN the page displays the advisor's expertise tags, spoken languages, timezone, experience, and a connect button

#### Scenario: No advisors available

- GIVEN the advisor list is empty
- WHEN the user opens the Advisors screen
- THEN the app displays an error toast and navigates back automatically

---

### Requirement: Canary Wallet Educational Content

The app MUST provide a Canary Wallets informational screen (available to L2 and above) explaining what a canary wallet is and how it can be used as a honeypot detection mechanism. The screen MUST include a call-to-action that navigates the user to the signing keys management section to set up a canary vault.

#### Scenario: L2 user reads canary wallet explanation and navigates to setup

- GIVEN the user is on the Hodler (L2) plan
- WHEN the user opens the Canary Wallets screen from Key Security
- THEN the description, illustration, and setup call-to-action are displayed
- AND tapping the call-to-action navigates the user to the home screen with the keys tab selected

---

## Non-Goals

- This spec does not cover the broader vault creation flow or vault migration mechanics in general; those are specified in `vault/spec.md`.
- This spec does not cover health checks on inheritance-related signing keys; those are specified in `health-checks/spec.md`.
- This spec does not cover sending from a Miniscript vault (PSBT construction, signing, broadcast); that is specified in `send-and-receive/spec.md`.
- This spec does not cover the POLICY_SERVER assisted signing configuration (spending limits, signing delays); that is specified in `vault/spec.md`.
- This spec does not cover cloud backup of vault descriptors or recovery from seed; those are specified in `backup-and-recovery/spec.md`.
- This spec does not cover UAI (User Action Item) notifications for canary vault balance changes or signing delays; those are specified in `notifications/spec.md`.
- This spec does not cover the full canary vault lifecycle (creation, alerting, balance monitoring); that is specified in `vault/spec.md` and `notifications/spec.md`.
- This spec does not define the Calendly-based call scheduling flow; that is in scope for `concierge/spec.md`.
