## ADDED Requirements

### Requirement: Server list warning message does not overlap list items
The Server Settings screen SHALL render the no-connection `WarningNote` as a static element below the scrollable server list so that it always appears below the last server item and never obscures any action button.

#### Scenario: Warning note visible below last server item
- **WHEN** the server list contains one or more entries and no server is connected
- **THEN** the `WarningNote` SHALL appear below the scroll area, above the "Add New Node" button
- **THEN** the Delete and Connect buttons on every `ServerItem` SHALL be fully visible and not obscured by the `WarningNote`

#### Scenario: Warning note absent when a server is connected
- **WHEN** the server list contains one or more entries and at least one server is connected
- **THEN** no `WarningNote` SHALL be rendered

#### Scenario: Add New Node button always accessible
- **WHEN** the Server Settings screen is displayed with any number of servers
- **THEN** the "Add New Node" button SHALL remain fixed at the bottom of the screen and SHALL NOT scroll with the list
