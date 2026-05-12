# Concierge Specification

## Status: Deprecated

## Purpose

Zendesk/ticketing-based Concierge support is no longer part of Bitcoin Keeper. This
spec is retained only as a historical reference if needed. It must not be used as an
active product source for coding agents unless a new non-ticketing Concierge product
is explicitly introduced.

## Removed from Active Scope

- Zendesk ticket creation
- Ticket list
- Ticket detail
- Ticket comments/replies
- Unread support badge
- Ticket status tracking
- Ticket attachment upload
- Support backend registration for Zendesk/ticketing
- Ticket notifications
- Support ticket allowances
- Subscription-tier support access
- Account manager tier
- Paid-tier Concierge access

## Diagnostics

Any diagnostics flow that remains active should be moved to Settings or a dedicated
Diagnostics spec. Diagnostics must require user consent and must not collect:
- Recovery Key
- Passcode/PIN
- Private keys
- Signer seed material
- Biometric data

## Donations

Do not replace Concierge with donations. Donation support belongs in Settings or a
future Donations spec. Donations must be optional and must never imply paid support.

## Acceptance Criteria

- Zendesk/ticketing Concierge is removed from active scope.
- No ticket creation/list/detail/comment requirements remain in active specs.
- No ticket notification requirements remain in active specs.
- No subscription/tier support logic remains.
- Any remaining diagnostics flow is moved out of Concierge and requires consent.
- Donations are handled separately.

---

## Historical Content (Archived — Do Not Implement)

The requirements below are preserved as historical reference only. They MUST NOT
be used as active implementation guidance.

---

## Requirements

### Requirement: Concierge Onboarding Modal

The app MUST present a one-time onboarding modal the first time the user opens the Concierge feature, explaining what the Concierge is and how to use it. Once the user confirms the modal, it MUST NOT be shown again on subsequent opens.

#### Scenario: First-time Concierge open

- GIVEN the user has never opened the Concierge feature before
- WHEN the user navigates to the Concierge screen
- THEN the onboarding modal is displayed explaining the Concierge service
- AND a confirm button is visible to proceed

#### Scenario: Confirm and dismiss onboarding modal

- GIVEN the onboarding modal is displayed
- WHEN the user taps the confirm button
- THEN the modal closes
- AND it is permanently marked as seen so it will not appear again

#### Scenario: Returning user skips onboarding modal

- GIVEN the user has previously confirmed the onboarding modal
- WHEN the user navigates to the Concierge screen
- THEN the onboarding modal is NOT shown

---

### Requirement: Concierge Home Screen

The app MUST present the Concierge home screen with entry points for Technical Support and future features (such as Expert Guidance). Features that are not yet available MUST be clearly marked and non-interactive.

#### Scenario: View Concierge home

- GIVEN the user has authenticated
- WHEN the user opens the Concierge section
- THEN the home screen is displayed with at least a Technical Support card
- AND any unavailable upcoming features are visually disabled and labeled as coming soon

#### Scenario: Free-tier ticket allowance badge

- GIVEN the user is on the free (Pleb) subscription tier
- WHEN the user views the Concierge home screen
- THEN the Technical Support entry shows an indicator of how many free tickets are available on that tier

---

### Requirement: Ticket Creation

The user MUST be able to create a support ticket by providing a text description. The ticket MUST be submitted to the backend and a confirmation MUST be shown upon successful creation.

#### Scenario: Create a ticket with description only

- GIVEN the user is on the Create Ticket screen
- WHEN the user enters a description and submits
- THEN a ticket is created with the provided description
- AND a success confirmation is displayed to the user
- AND the new ticket appears in the user's ticket list

#### Scenario: Attempt to submit an empty ticket

- GIVEN the user is on the Create Ticket screen
- WHEN the user attempts to submit without entering any description
- THEN submission is blocked
- AND an error message is shown requesting the user to provide a description

#### Scenario: Attach diagnostic context to a ticket

- GIVEN the user is on the Create Ticket screen
- WHEN the user opts to include one or more of: device information, wallet/vault summary, app version and tier, or network/node status
- THEN the selected details are appended to the ticket description before submission
- AND the final submitted description contains the chosen diagnostic data

#### Scenario: Attach a screenshot to a ticket

- GIVEN the user is on the Create Ticket screen
- WHEN the user attaches one or more images
- THEN the images are uploaded as attachments alongside the ticket description

#### Scenario: Ticket pre-filled from an error context

- GIVEN the user encounters an error on a specific screen
- WHEN the user opens the Create Ticket flow from that error context
- THEN the description is pre-filled with the error details and the name of the screen where the error occurred

#### Scenario: Ticket creation fails due to a backend error

- GIVEN the user submits a ticket
- WHEN the backend returns an error
- THEN the ticket is NOT created
- AND an error message is displayed asking the user to try again

---

### Requirement: Ticket Tagging

Tickets MUST be associated with one or more contextual tags (e.g., wallet, vault, backup, keys, settings) when created from a specific area of the app so that the support team can triage them effectively.

#### Scenario: Open ticket creation from a specific screen

- GIVEN the user opens the Create Ticket flow from a context such as the Vault or Backup screen
- WHEN the ticket is submitted
- THEN the ticket is tagged with the relevant domain tag(s) matching the originating context

#### Scenario: Open ticket creation from the Concierge home screen

- GIVEN the user opens the Create Ticket flow directly from the Concierge home screen without a specific feature context
- WHEN the ticket is submitted
- THEN the ticket carries a general Keeper Concierge tag

---

### Requirement: Ticket Listing

The app MUST display all support tickets (open and resolved) associated with the authenticated user in reverse chronological order.

#### Scenario: View tickets with existing history

- GIVEN the user has previously created one or more support tickets
- WHEN the user opens the Technical Support screen
- THEN all tickets are listed showing: ticket reference ID, creation timestamp, description preview, and status (Open or Solved)

#### Scenario: View tickets with no history

- GIVEN the user has never created a support ticket
- WHEN the user opens the Technical Support screen
- THEN an empty state is shown indicating no conversations exist yet
- AND a call-to-action to create a new ticket is visible

#### Scenario: Ticket list fails to load

- GIVEN the user opens the Technical Support screen
- WHEN the backend request to fetch tickets fails
- THEN an error message is shown
- AND the user is returned to the previous screen

---

### Requirement: Ticket Comments

The user MUST be able to view all comments on an existing ticket and post new comments on any ticket that is not yet resolved. The display MUST distinguish comments authored by the user from those authored by the support team.

#### Scenario: Read comments on an open ticket

- GIVEN the user opens a ticket that has existing comments
- WHEN the ticket detail screen loads
- THEN all comments are displayed in chronological order
- AND each comment shows the author (user or support team), timestamp, body text, and any image attachments

#### Scenario: Post a new comment on an open ticket

- GIVEN the user is viewing an open ticket detail screen
- WHEN the user types a reply and submits it
- THEN the comment is sent to the backend
- AND the comment list refreshes and scrolls to the new entry

#### Scenario: Reply is blocked on a resolved ticket

- GIVEN the user is viewing a ticket with Solved status
- WHEN the ticket detail screen is displayed
- THEN the comment input field is NOT available
- AND a status message indicates the issue is resolved

#### Scenario: User receives a team reply

- GIVEN the support team has posted a reply on the user's ticket
- WHEN the user opens that ticket
- THEN the team's reply is displayed as a distinct conversation entry attributed to the Keeper Tech Team

---

### Requirement: Unread Comment Badge

The app MUST display a visual indicator on a ticket list item when that ticket has received new comments since the user last viewed it.

#### Scenario: New comment received from support team

- GIVEN a support ticket has received a new comment since the user last opened it
- WHEN the user views the ticket list
- THEN the affected ticket item displays an unread indicator (e.g., a red dot)

#### Scenario: Badge cleared after viewing

- GIVEN a ticket has an unread indicator
- WHEN the user opens the ticket detail and the comments load successfully
- THEN the unread indicator is cleared for that ticket

---

### Requirement: Ticket Status UAI Alert

The app MUST add a User Action Item to the UAI stack when a ticket's status changes (e.g., a reply is received or the ticket is resolved), so the user is alerted even when not inside the Concierge section.

#### Scenario: Ticket update triggers UAI

- GIVEN the backend notifies the app of a new comment or status change on a ticket
- WHEN the app processes the notification
- THEN a UAI of type Zendesk Ticket is added to the UAI stack
- AND the UAI surface on the home screen reflects the new item

---

### Requirement: Account Manager Panel

For users on the Keeper Private (L4) subscription tier, the app SHOULD display a dedicated account manager panel instead of the standard ticket list. The panel MUST show the account manager's full name, profile photo, and all available contact links.

#### Scenario: Keeper Private user views account manager

- GIVEN the user is on the Keeper Private (L4) subscription tier
- WHEN the user opens the Technical Support screen
- THEN the account manager panel is displayed with the manager's name, photo, and available contact links (such as email, phone, WhatsApp, Telegram, Calendly)

#### Scenario: Contact via a provided link

- GIVEN the account manager panel is displayed
- WHEN the user taps a contact link (e.g., email, WhatsApp, Calendly)
- THEN the device opens the appropriate external app or service to initiate contact

#### Scenario: Account manager data unavailable

- GIVEN the user is on the Keeper Private (L4) subscription tier
- WHEN the backend does not return account manager details
- THEN an informative message is shown directing the user to contact Concierge support instead
- AND the standard ticket interface is displayed as a fallback

---

### Requirement: Onboarding Call Scheduling

The app SHOULD allow users on the Diamond Hands (L3) tier and above to request an onboarding call with the support team by providing their email address. Once scheduled, the call scheduling entry point MUST be hidden so it cannot be requested again.

#### Scenario: Diamond Hands user schedules an onboarding call

- GIVEN the user is on the Diamond Hands (L3) tier or above
- AND an onboarding call has not yet been scheduled
- WHEN the user taps the schedule onboarding call entry and provides a valid email address
- THEN the request is sent to the backend
- AND a success message informs the user to check their email to select a time
- AND the scheduling entry point is permanently hidden

#### Scenario: Onboarding call CTA hidden after scheduling

- GIVEN the user has already requested an onboarding call
- WHEN the user returns to the Technical Support screen
- THEN the schedule onboarding call entry point is NOT displayed

#### Scenario: Onboarding call scheduling fails

- GIVEN the user submits their email to schedule a call
- WHEN the backend returns an error
- THEN an error message is shown asking the user to try again
- AND the scheduling entry point remains visible

#### Scenario: Non-eligible tier user sees disabled CTA

- GIVEN the user is on a tier below Diamond Hands (L3)
- WHEN the user views the Technical Support screen
- THEN the schedule onboarding call entry point is displayed but disabled
- AND the user cannot interact with it

---

### Requirement: User Registration with Support Backend

The app MUST transparently register the user with the support backend the first time they initiate a support ticket flow. This registration MUST be performed using an anonymized identifier derived from the user's primary seed, with no personally identifiable information submitted without explicit user action.

#### Scenario: First-time ticket initiation triggers registration

- GIVEN the user has never created a support ticket
- WHEN the user taps the action to create a new ticket
- THEN the app automatically registers the user with the support backend using an anonymized identifier
- AND upon successful registration, the ticket creation screen is displayed

#### Scenario: Registration failure prevents ticket creation

- GIVEN the user attempts to initiate a ticket
- WHEN the backend registration request fails
- THEN the ticket creation screen is NOT opened
- AND an error message is shown asking the user to try again

#### Scenario: Already-registered user proceeds directly

- GIVEN the user has previously been registered with the support backend
- WHEN the user taps the action to create a new ticket
- THEN the ticket creation screen opens immediately without a re-registration request

---

## Non-Goals

- This spec does not cover the technical implementation of the backend ticketing service (Zendesk or any replacement).
- This spec does not define how push notification delivery for ticket events is handled; that is covered by the `notifications` domain.
- This spec does not cover subscription plan management, upgrade flows, or feature gating logic beyond the tier-conditional behavior described above; those are covered by the `subscription` domain.
- This spec does not cover the Expert Guidance feature (connecting users with third-party advisors), which is listed as coming soon and has no functional behavior at the time of writing.
- This spec does not cover the internal structure of diagnostic data collected for ticket attachments; the requirement is only that the user can consent to include such data.
- This spec does not cover the content or accuracy of the support team's responses to tickets.
