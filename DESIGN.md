---
name: Bitcoin Keeper Design System
version: 1.0
status: baseline
type: design.md
product: Bitcoin Keeper
platforms:
  - iOS
  - Android
implementation_source_of_truth:
  components: existing React Native codebase
  colors: existing theme constants, with palette below as design reference
  spacing: existing theme constants and common components first
  typography: existing theme constants and common components first
  feature_flows: separate feature requirements
  final_copy: separate feature requirements
mode: adaptive
principle: evolve Keeper visually without breaking recognizability
---

# Bitcoin Keeper DESIGN.md

## Purpose

This file is the permanent UI guidance file for Bitcoin Keeper.

It is for AI coding agents and developers working on UI implementation. It is not a feature specification. Feature flows, logic, validations, edge cases, and exact screen copy are supplied separately in requirement documents.

Use this file to preserve Keeper’s visual language, layout consistency, interaction feel, and UI quality across future work.

## Source of truth

The existing React Native codebase is the source of truth for implementation.

Agents must:
- inspect and reuse existing Keeper UI components before creating new ones
- use existing theme tokens, styles, spacing, radius, typography, and colors from code where available
- use existing navigation, card, button, list, modal, sheet, form, and warning patterns
- build new UI from existing primitives where possible
- avoid hardcoding one-off values unless there is no existing token or component pattern
- keep feature-specific flow and copy decisions inside the relevant requirement spec
- treat this document as design guidance, not business logic

## Design mode

Keeper is not visually frozen.

Agents may:
- improve layout spacing
- improve hierarchy
- improve readability
- improve accessibility
- simplify crowded screens
- modernize components gradually
- refine visual balance while staying recognizably Keeper

Agents should not:
- perform a full visual redesign unless explicitly requested
- introduce a new design language
- introduce exchange-style or trading-style UI patterns
- create visual inconsistency for a single feature
- add decorative UI that does not improve comprehension or confidence

# Design principles

## Product feel

Keeper should feel:
- calm
- secure
- focused
- private
- human
- premium but not flashy
- bitcoin-specific
- non-speculative
- practical
- trustworthy without being corporate

Avoid:
- crypto app aesthetics
- exchange or trading app patterns
- neon accents
- crowded dashboards
- gamified UI
- urgency-driven UX
- fear-driven security language
- excessive gradients
- excessive animation
- unnecessary visual novelty

## User confidence

Keeper handles serious user actions. The UI should help users feel informed, not overwhelmed.

Preferred approach:
- show one main decision at a time
- keep CTAs clear
- explain trade-offs when relevant
- avoid long educational blocks unless the feature requires it
- make recovery, backup, and signing actions feel deliberate
- use calm warnings, not panic messages

# Design tokens

These tokens represent the current Keeper visual system as inferred from the provided Figma references and screenshots. Use existing code constants first. If the codebase already defines equivalent tokens, use the codebase names and values.

## Colors

```yaml
colors:
  primary:
    green:
      value: "#2D6759"
      usage: Primary brand color, headers, primary buttons, active navigation, important icons.
    brown:
      value: "#91785C"
      usage: Warm secondary accent. Use sparingly.
    cream:
      value: "#F7F2EC"
      usage: Main light surface and brand cream background.

  text:
    title:
      value: "#041513"
      usage: Primary headings and high emphasis text.
    body:
      value: "#24312E"
      usage: Body copy and standard readable text.
    muted:
      value: "#878787"
      usage: Secondary labels, inactive items, non-critical metadata.
    placeholder:
      value: "#8E8E8E"
      usage: Placeholder and disabled text.
    on_dark:
      value: "#F2EDE6"
      usage: Text on dark green or dark surfaces.

  surfaces:
    app_background:
      value: "#F2EDE6"
      usage: Main app background in light mode.
    bright_background:
      value: "#FDF7F0"
      usage: Slightly brighter cards or input backgrounds.
    card_background:
      value: "#F7F2EC"
      usage: Cards, sheets, and grouped surfaces.
    muted_background:
      value: "#DDDED8"
      usage: Disabled, placeholder, or dashed add-card backgrounds.
    dark_surface:
      value: "#041513"
      usage: Dark mode base or very high contrast dark UI.
    dark_green_surface:
      value: "#2D6759"
      usage: Wallet cards, headers, primary surfaces.
    secondary_dark_surface:
      value: "#3E524D"
      usage: Notifications, dark secondary surfaces.

  border:
    default:
      value: "#D4D4D4"
      usage: Dividers, card borders, input borders.
    subtle:
      value: "#DDDED8"
      usage: Low contrast boundaries and inactive containers.

  feedback:
    red:
      value: "#F72E2C"
      usage: Destructive action, error icon, critical alert.
    error_background:
      value: "#F7F2EC"
      usage: Error surface if matching current token exists in code.
    warning_background:
      value: "#F7F2EC"
      usage: Toast or warning background if matching current token exists in code.

  tags:
    tag_1:
      value: "#006769"
    tag_2:
      value: "#2C7865"
    tag_3:
      value: "#58A399"
    tag_4:
      value: "#1A5D1A"
    tag_5:
      value: "#557C56"
    tag_6:
      value: "#40A578"
    tag_7:
      value: "#A9B388"
    tag_8:
      value: "#40A578"
    tag_9:
      value: "#80AF81"
    tag_10:
      value: "#A2CA71"

  labels:
    label_1:
      value: "#C7B664"
    label_2:
      value: "#5BBFA8"
    label_3:
      value: "#DEA66D"
```

## Color usage rules

Use color with restraint.

Rules:
- use green as the primary action and brand anchor
- use cream backgrounds for calm reading surfaces
- use red only for real errors, destructive actions, or critical security warnings
- use grey for inactive or secondary information
- use tag colors only for labels, wallet categorization, states, or small badges
- do not introduce new accent colors unless the existing palette cannot support the UI
- do not use bright crypto-style colors
- do not use color alone to communicate critical meaning

# Typography

## Font family

```yaml
typography:
  font_family:
    primary: "Inter"
  font_weights:
    light: 300
    regular: 400
    medium: 500
    semi_bold: 600
    bold: 700
```

## Type scale

Use codebase typography tokens first. The following scale should be used as the design reference when token names are missing or when creating a new UI pattern.

```yaml
typography_scale:
  title_1:
    font_size: 32
    line_height: 40
    font_weight: 700
    usage: Major screen titles, onboarding title, important identity moments.
  title_2:
    font_size: 28
    line_height: 36
    font_weight: 700
    usage: Screen-level titles where title_1 is too large.
  title_3:
    font_size: 24
    line_height: 32
    font_weight: 600
    usage: Prominent section titles and modal headings.

  heading_1:
    font_size: 20
    line_height: 28
    font_weight: 600
    usage: Section headings, card titles, important grouped actions.
  heading_2:
    font_size: 18
    line_height: 26
    font_weight: 600
    usage: Card headers, list section headers, secondary screen headings.
  heading_3:
    font_size: 16
    line_height: 24
    font_weight: 600
    usage: Compact labels, small card headings, action labels.

  body_1:
    font_size: 16
    line_height: 24
    font_weight: 400
    usage: Main body copy, helper text, screen descriptions.
  body_2:
    font_size: 14
    line_height: 22
    font_weight: 400
    usage: Secondary copy, list subtitles, metadata.
  body_3:
    font_size: 13
    line_height: 20
    font_weight: 400
    usage: Compact helper copy and low-emphasis metadata.

  caption_0:
    font_size: 12
    line_height: 18
    font_weight: 500
    usage: Badges, pill labels, status tags.
  caption_1:
    font_size: 11
    line_height: 16
    font_weight: 500
    usage: Small metadata and compact labels.
  caption_2:
    font_size: 10
    line_height: 14
    font_weight: 500
    usage: Very small labels only where space is constrained.
  caption_3:
    font_size: 9
    line_height: 13
    font_weight: 500
    usage: Avoid unless inherited from existing components.
```

## Typography rules

Rules:
- use Inter everywhere unless the existing codebase specifies otherwise
- use bold or semi-bold for headings, not for long body copy
- keep body copy readable at 14 to 16 px
- avoid text smaller than 12 px unless it is already part of an existing component
- avoid long paragraphs inside cards
- avoid using many font sizes on the same screen
- use title styles sparingly
- preserve strong hierarchy between title, body, helper text, and metadata

# Spacing system

Use existing spacing constants and component padding from the codebase first. If a new layout needs spacing and no exact token exists, follow this reference scale.

```yaml
spacing:
  scale:
    xxs: 4
    xs: 8
    sm: 12
    md: 16
    lg: 20
    xl: 24
    xxl: 32
    xxxl: 40
    huge: 48
```

## Padding

```yaml
padding:
  screen_horizontal:
    value: 24
    usage: Default horizontal padding for full-screen content.
  screen_top:
    value: 24
    usage: Top content spacing below header when no custom header exists.
  card_default:
    value: 20
    usage: Default card internal padding.
  card_compact:
    value: 16
    usage: Compact list cards or smaller grouped cards.
  card_large:
    value: 24
    usage: Educational or high-importance cards.
  list_item_horizontal:
    value: 20
    usage: Rows inside grouped cards.
  list_item_vertical:
    value: 16
    usage: Rows inside grouped cards.
  button_horizontal:
    value: 24
    usage: Button label padding when not full width.
  button_vertical:
    value: 16
    usage: Default large CTA vertical padding.
  bottom_safe_area:
    value: 24
    usage: Padding above device safe area for bottom CTAs.
```

## Margins

```yaml
margin:
  section_top:
    value: 32
    usage: Space before a new major section.
  section_after_heading:
    value: 16
    usage: Space between a section heading and its content.
  card_between:
    value: 16
    usage: Vertical spacing between cards.
  content_block_between:
    value: 24
    usage: Space between major content blocks.
  inline_icon_gap:
    value: 8
    usage: Gap between icon and text in buttons or rows.
  row_between:
    value: 12
    usage: Vertical gap between related rows.
  header_to_content:
    value: 24
    usage: Gap between header and first content item.
```

## Gutters

```yaml
gutters:
  two_column_grid:
    value: 16
    usage: Gap between two cards in a mobile two-column grid.
  card_internal_columns:
    value: 16
    usage: Gap between icon column and text column.
  grouped_action_gap:
    value: 12
    usage: Gap between related inline actions.
  bottom_nav_items:
    value: 24
    usage: Minimum visual spacing between tab items, adjusted by layout.
```

## Spacing rules

Rules:
- prefer the existing component’s spacing over custom local spacing
- use 24 px as the default screen side padding where existing screens support it
- use 16 px as the default grid gutter
- use 16 to 20 px padding inside cards
- use 32 px before major sections
- avoid cramped rows for security or recovery information
- avoid uneven margins created only to fit content on one screen
- preserve safe area padding on iOS and Android
- use scroll rather than shrinking important text or buttons too much

# Shape and radius

Use existing component radius values from the codebase first. The reference style is soft and rounded.

```yaml
radius:
  small:
    value: 8
    usage: Small badges, chips, compact inner elements.
  medium:
    value: 12
    usage: Inputs, small cards, compact surfaces.
  large:
    value: 16
    usage: Standard cards and grouped panels.
  xlarge:
    value: 24
    usage: Large cards, bottom sheets, major containers.
  pill:
    value: 999
    usage: Pills, tags, toggles, round buttons.
```

Rules:
- cards should use soft rounded corners
- buttons should look friendly and tappable
- tags and wallet labels should use pill shapes
- avoid sharp enterprise-style rectangles
- avoid very large radius values on dense content

# Layout patterns

## App shell

Keeper commonly uses:
- top header area
- cream content background
- card-based content
- bottom navigation on main tabs
- full-screen stack navigation for deeper settings or workflows
- fixed or safe-area-aware CTAs for important actions

Rules:
- maintain a stable bottom navigation for main app areas
- do not restructure primary tabs unless explicitly required
- preserve recognizable Keeper headers
- maintain clear separation between header and content
- use cards for grouped decisions and settings
- avoid dense tables unless the content is naturally tabular

## Header pattern

Current Keeper headers often use:
- deep green background on main tabs
- circular icon container
- screen title
- notification icon on the right

Rules:
- keep main tab headers visually consistent
- use large header treatment for top-level tabs
- use simpler back-title headers for nested screens
- avoid mixing unrelated header styles within the same area
- use clear back affordances on nested screens

## Cards

Cards are a primary Keeper pattern.

Use cards for:
- wallets
- keys
- grouped settings
- backup and recovery sections
- concierge actions
- warning content
- educational content
- server and configuration entries

Rules:
- use existing card components first
- keep padding generous
- keep hierarchy clear inside cards
- use icons as anchors, not decoration
- keep card actions predictable
- avoid overloading cards with too many actions
- avoid mixing too many visual styles on one screen

## Lists and settings

Use grouped card lists for settings and preference screens.

Rules:
- use section headings for major groups
- keep each row to one primary label and one helper line where needed
- use chevrons for navigational rows
- use toggles only for immediate on/off settings
- avoid placing destructive actions beside normal actions without separation
- preserve divider styling from existing components

## Grids

Two-column grids are acceptable for compact object lists such as keys.

Rules:
- use 16 px gutters by default
- keep card heights consistent within a grid
- ensure card content does not feel cramped
- preserve tap target size
- avoid more than two columns on mobile

## Bottom navigation

Rules:
- keep labels short
- keep icons visually consistent
- use active green state
- use muted grey inactive state
- avoid adding temporary items
- avoid hiding core navigation behind gestures

## Buttons

Rules:
- one primary CTA per main decision area
- primary buttons should generally be full-width on mobile
- secondary actions should be visually quieter
- destructive actions should be clearly separated
- disabled states must remain readable but obviously inactive
- avoid multiple stacked primary buttons
- avoid small text-only actions for critical flows

## Bottom sheets and modals

Use sheets and overlays for:
- confirmations
- quick choices
- temporary educational context
- warnings that require focused attention

Rules:
- keep overlays focused
- avoid nesting modals inside modals
- do not put long multi-step flows inside a bottom sheet unless existing Keeper patterns already do this
- use full screens for complex tasks
- keep CTA placement predictable

# UI content and wording

Final copy comes from feature requirement specs. This file only defines the style of wording.

Rules:
- keep copy short and simple
- explain trade-offs when relevant
- use bitcoin-specific wording
- avoid generic crypto terminology
- avoid hype
- avoid fear
- avoid long explanations unless required for security or recovery
- avoid vague CTAs like Continue when a more specific action is clearer
- use plain English over protocol jargon
- use technical terms only when the user needs them to make a safe decision

Preferred wording qualities:
- direct
- calm
- practical
- human
- specific
- not sales-like

# Security UX

Keeper security UX should feel deliberate and calm.

Rules:
- explain what the user is confirming
- explain the consequence of mistakes where needed
- avoid panic language
- avoid warning fatigue
- distinguish critical alerts from normal guidance
- use progressive disclosure for advanced detail
- keep signing and recovery flows visually focused
- avoid decorative distractions during critical steps

Examples of good security surfaces:
- clear title
- short explanation
- one obvious action
- optional detail if needed
- calm visual warning if risk is real

# States

Every new UI should account for states when relevant.

Required state categories:
- default
- loading
- empty
- disabled
- success
- error
- offline
- partial completion
- warning
- permission needed
- unavailable

Rules:
- use existing loading and empty state components first
- error states should say what happened and what the user can do
- success states should be short and confirm completion
- disabled states should make the reason clear when not obvious
- offline states should not imply funds or keys are at risk unless they are

# Accessibility

Rules:
- keep body text readable
- maintain adequate contrast
- avoid relying only on color
- keep important tap targets comfortable
- support dynamic text where existing app architecture allows it
- avoid tiny captions for important information
- keep critical controls reachable and visible
- preserve safe area handling
- avoid motion-only feedback

# Modernization guidance

Modernization is allowed when it improves usability.

Good modernization:
- cleaner hierarchy
- better spacing
- fewer competing elements
- stronger card consistency
- clearer CTAs
- improved readable contrast
- better screen balance
- simpler setting rows
- better state handling

Bad modernization:
- redesigning the app into a different product
- copying exchange or fintech dashboards
- adding trendy visual effects
- replacing familiar Keeper patterns without need
- introducing multiple new component styles for one feature

# Key existing components

Do not recreate these. Use them directly.

| Pattern | Component | Location | When to use |
|---|---|---|---|
| Home screen inline alert / notification banner | `UAIView` | `src/screens/Home/components/UAIView.tsx` | Any non-modal, non-blocking alert row on the Wallets screen: backup reminders, health checks, signer warnings, canary alerts. Wrap in `<Box backgroundColor={seashellWhite}>`. |
| Notification card (UAI card with modal) | `Card` (inside `NotificationsCenter`) | `src/screens/Home/Notifications/NotificationsCenter.tsx` | Full UAI notification entries driven by the UAI stack. |
| Bottom sheet / modal | `KeeperModal` | `src/components/KeeperModal.tsx` | Confirmations, educational overlays, skip-warning flows. Supports `secondaryButtonText` / `secondaryCallback`. |
| Seed word confirmation input | `ConfirmSeedWord` | `src/components/SeedWordBackup/ConfirmSeedWord.tsx` | Any flow requiring the user to enter one word from their Recovery Key. Handles random index selection and validation internally. |
| Inline modal wrapper (swipeable) | `ModalWrapper` | `src/components/Modal/ModalWrapper.tsx` | Swipeable bottom sheets rendered over a screen (not full navigation reset). |
| Primary + secondary buttons | `Buttons` | `src/components/Buttons.tsx` | All primary/secondary CTA pairs on screens and sheets. |
| Toast / snackbar | `useToastMessage` hook → `showToast()` | `src/hooks/useToastMessage.tsx` | Brief success or error feedback after an action. |
| Themed text | `Text` (KeeperText) | `src/components/KeeperText.tsx` | All text rendering. Accepts `color` as a theme token string. |

# Agent implementation checklist

Before implementing UI, the agent should check:
- Is there an existing Keeper component for this pattern?
- Is there an existing screen that already solves a similar layout?
- Are colors, typography, spacing, and radius coming from theme/common styles?
- Is there only one primary action in the main decision area?
- Does the UI remain calm and readable?
- Does the UI avoid crypto/exchange aesthetics?
- Does the screen work on smaller iPhones?
- Are critical actions reachable and clearly labeled?
- Are loading, error, empty, and disabled states handled where relevant?
- Does the UI follow the feature requirement without adding new product logic?

# Relationship to feature specs

Feature specs provide:
- user flow
- exact copy
- validation rules
- business logic
- edge cases
- navigation behavior
- success and failure behavior
- feature-specific screens and states

This DESIGN.md provides:
- visual system guidance
- layout rules
- typography guidance
- spacing guidance
- color guidance
- component reuse rules
- interaction feel
- UI best practices

When there is conflict:
- product behavior follows the feature spec
- implementation values follow the codebase
- visual judgment follows this DESIGN.md
