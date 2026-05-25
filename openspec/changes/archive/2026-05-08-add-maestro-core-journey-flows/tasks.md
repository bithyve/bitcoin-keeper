## 1. UI Components (Maestro Flow Assets)

- [x] 1.1 Add `flows/core_onboarding_setup.yaml` to compose onboarding/setup coverage using existing base flows.
- [x] 1.2 Add `flows/core_wallet_viewing.yaml` to compose wallet viewing coverage using existing wallet detail/view flows.
- [x] 1.3 Add `flows/core_receive_send.yaml` to compose receive + send wallet journey coverage.
- [x] 1.4 Add `flows/core_app_settings.yaml` to compose app settings journey coverage.
- [x] 1.5 Add `flows/core_key_management.yaml` to compose key-management journey coverage.
- [x] 1.6 Add `flows/core_regression.yaml` as the top-level smoke/regression entrypoint that runs all journey flows.

## 2. Business Logic / Hooks

- [x] 2.1 Verify no React Native business logic/hook changes are required for this Maestro-only coverage update.

## 3. Store (Slice + Saga)

- [x] 3.1 Verify no Redux slice/saga changes are required for this Maestro-only coverage update.
- [x] 3.2 Verify no Redux Persist migration update in `src/store/migrations.ts` is required.

## 4. Storage

- [x] 4.1 Verify no Realm schema or MMKV key changes are required for this Maestro-only coverage update.

## 5. Tests

- [x] 5.1 Validate new YAML flow files for syntax/style consistency with existing `flows/` conventions.
- [x] 5.2 Run a targeted Maestro flow lint/parse check available in this repository and confirm success.
