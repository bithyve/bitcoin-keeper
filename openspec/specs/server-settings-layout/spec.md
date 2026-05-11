# server-settings-layout Specification

## Purpose
Define how the Server Settings screen lays out saved Electrum servers and offline guidance so informational warnings do not overlap server actions.
## Requirements
### Requirement: Server settings warning placement
The Server Settings screen SHALL render offline guidance after the saved Electrum server list content so that `NodeDetail` entries and their actions remain readable and tappable when no server is connected.

#### Scenario: Warning follows saved server cards
- **GIVEN** a user has one or more saved Electrum servers and no server is currently connected
- **WHEN** the Server Settings screen renders the saved server list
- **THEN** the offline warning SHALL appear after the final server card instead of overlapping any Delete or Connect action

#### Scenario: Empty server state still shows guidance
- **GIVEN** a user has no saved Electrum servers and no server is currently connected
- **WHEN** the Server Settings screen renders
- **THEN** the screen SHALL continue showing offline guidance separately from the add-node action without overlapping other content
