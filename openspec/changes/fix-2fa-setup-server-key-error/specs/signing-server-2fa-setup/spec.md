# Signing Server 2FA Setup — Error Handling

## Overview

The Server Key 2FA setup flow (`SetupSigningServer` screen) must handle registration
failures and QR code rendering failures gracefully, providing the user with actionable
feedback and a path to retry.

## Requirements

### REQ-1 — Registration error always propagates
**Given** a call to `SigningServer.register(policy)` fails for any reason (network error,
server error, timeout, SSL failure),  
**When** the axios catch block is entered,  
**Then** an error with a human-readable message is always rethrown so the caller receives
exactly one, meaningful exception.

### REQ-2 — Screen shows error state on registration failure
**Given** `registerSigningServer()` throws,  
**When** the error is caught in the screen,  
**Then** the spinner is replaced by an error message, and a "Retry" button allows the user
to re-attempt registration without navigating away.

### REQ-3 — Safe nested property access for API response
**Given** the server returns a registration response where `setupData.verification` may be
absent or `null`,  
**When** the `verifier` property is read,  
**Then** optional chaining is used so that no secondary TypeError is thrown; missing data
falls back to an empty string, keeping the spinner/error state visible.

### REQ-4 — Loading guard handles all falsy validation keys
**Given** `validationKey` can be `''`, `undefined`, or `null` (before the server response
arrives or when registration fails),  
**When** the component renders,  
**Then** `!validationKey` is used as the guard condition instead of `validationKey === ''`
so that the QR code is never rendered with a falsy key.

### REQ-5 — QR render errors handled gracefully
**Given** the QR code generation fails at render time (e.g. library issue on iOS),  
**When** `KeeperQRCode` is given an `onError` callback,  
**Then** the error is forwarded to that callback instead of crashing the component tree.

## Acceptance Scenarios

### SC-1 — Network failure during registration
1. Device has no network connectivity.
2. User navigates to "Set up 2FA for Server Key".
3. **Expected**: Spinner shows briefly, then transitions to an error message ("Unable to
   register server key") + "Retry" button. No toast with an internal TypeError message.

### SC-2 — Successful registration
1. Network is available and server returns a valid `verifier`.
2. User navigates to "Set up 2FA for Server Key".
3. **Expected**: Spinner shows briefly, then the TOTP QR code and manual key are both
   displayed. No error toast.

### SC-3 — QR code render failure (iOS)
1. Registration succeeds but the QR code library fails to render.
2. **Expected**: Error is caught by `onError`; user still sees the manual key and can
   proceed to validate manually. No unhandled crash.
