## ADDED Requirements

### Requirement: Server Selection screen SHALL maintain status-bar clearance across tab switches on iOS
On iOS, the Server Selection screen header and content SHALL remain below the system status bar (safe-area top inset) at all times, including after switching between the Public Server and Private Electrum tabs in any order and any number of times.

#### Scenario: Header stays below status bar after switching tabs
- **WHEN** the user opens the Server Selection screen on iOS
- **AND** switches to the Private Electrum tab
- **AND** switches back to the Public Server tab
- **THEN** the screen header and tab bar SHALL be positioned below the safe-area top inset with no overlap with the status bar

#### Scenario: Content stays below status bar without touching text inputs
- **WHEN** the user switches tabs without interacting with any text input
- **THEN** the layout SHALL remain identical to the initial render of the screen

#### Scenario: Content stays below status bar after keyboard interaction
- **WHEN** the user focuses a text input on the Private Electrum tab (keyboard appears)
- **AND** switches to the Public Server tab
- **THEN** the keyboard SHALL be dismissed
- **AND** the screen header SHALL be positioned correctly below the status bar with no overlap

### Requirement: Scroll position SHALL reset when switching tabs
The Server Selection `ScrollView` SHALL scroll to the top (y = 0) when the user switches between the Public Server and Private Electrum tabs.

#### Scenario: Public Server tab resets scroll position
- **WHEN** the user scrolls down in the Public Server tab
- **AND** switches to the Private Electrum tab
- **AND** switches back to the Public Server tab
- **THEN** the `ScrollView` SHALL be scrolled to y = 0

#### Scenario: Private Electrum tab resets scroll position
- **WHEN** the user scrolls down in the Private Electrum tab
- **AND** switches to the Public Server tab
- **AND** switches back to the Private Electrum tab
- **THEN** the `ScrollView` SHALL be scrolled to y = 0
