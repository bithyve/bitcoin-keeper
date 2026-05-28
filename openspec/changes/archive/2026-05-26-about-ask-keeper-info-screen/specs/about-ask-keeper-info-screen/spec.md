## ADDED Requirements

### Requirement: In-app "About Ask Keeper" info screen
The app SHALL provide an in-app info screen titled "About Ask Keeper" that presents clear, high-quality information about the Ask Keeper feature. This screen SHALL be accessible from the disclaimer modal CTA and SHALL follow the app’s design system as defined in DESIGN.md.

#### Scenario: Accessing the info screen from disclaimer modal
- **WHEN** the user taps the "Ask Keeper" CTA in the disclaimer modal
- **THEN** the app navigates to the "About Ask Keeper" info screen

#### Scenario: Content display
- **WHEN** the "About Ask Keeper" info screen is shown
- **THEN** the provided Ask Keeper information is displayed with correct formatting, layout, and UI quality per DESIGN.md

#### Scenario: Navigation back
- **WHEN** the user taps the back or close button on the info screen
- **THEN** the app returns to the previous screen or modal

#### Scenario: No external navigation
- **WHEN** the user accesses the "About Ask Keeper" info screen
- **THEN** the app does NOT open an external browser or web page

## MODIFIED Requirements

(none)

## REMOVED Requirements

(none)
