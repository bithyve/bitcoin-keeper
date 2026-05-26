## ADDED Requirements

### Requirement: Send Confirmation — Locked Donation Mode

When the `SendConfirmation` screen is opened with `isDonation: true` in its route params, the screen MUST display in a locked mode where:

- The transaction priority selector MUST be hidden — the user cannot change the fee tier.
- The fee priority MUST be fixed to `TxPriority.LOW` for signing.
- All recipient and amount fields are read-only (as in the standard confirmation flow).

This mode is used exclusively by the Donate Dust flow. When `isDonation` is absent or `false`, the screen MUST behave identically to its current behavior.

#### Scenario: Fee priority selector hidden in donation mode

- GIVEN `SendConfirmation` was opened with `isDonation: true`
- THEN the fee priority selector MUST NOT be visible
- AND the transaction MUST be prepared using the `low` fee rate

#### Scenario: Standard confirmation behavior unchanged without isDonation flag

- GIVEN `SendConfirmation` was opened without `isDonation` flag (or with `isDonation: false`)
- THEN the screen MUST display the fee priority selector as normal
- AND the user MUST be able to change the fee tier
