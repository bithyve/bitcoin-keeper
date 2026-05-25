# Maestro flow coverage limitations

These are known gaps that are partially covered or not fully automatable with Maestro alone:

- Hardware signer operations that require physical actions on external devices (Coldcard/Jade/Ledger/Passport/Keystone, etc.).
- External app handoff flows (buy providers, deep links, app-store redirects) where control leaves the tested app.
- OS-level permission dialogs that vary by device vendor, OS version, and locale (flows include best-effort conditionals only).
- Network-dependent outcomes that require deterministic on-chain or Electrum state (broadcast timing, mempool confirmation, fiat provider responses).
- Secure recovery phrase verification depth (flows only check navigation/visibility and never export or persist seed content).
