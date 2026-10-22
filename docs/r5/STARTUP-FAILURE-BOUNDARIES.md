# Fixed startup failure observations

The exact `1bc34890cb8618b2fffd446a63924974e0fe15b5` iOS diagnostic
window built and installed successfully, then failed its first Create a passcode
assertion. [The pinned artifact readout](https://github.com/KeeperCommunity/bitcoin-keeper/pull/7123)
found the fixed passcode-check error and Retry in one retained hierarchy snapshot.
The snapshot does not establish the current route, tap delivery or failure cause.
Its 616 own-process error records include 18 CONNECTION markers and 598
unclassified records. Those categories remain separate from this new observer.

The Splash catch covers both `hasPin` and the subsequent navigation call.
`hasPin` itself covers Redux state, account-service selection, native Keychain
reading and credential JSON parsing. An ordinary empty fresh Keychain resolves
false and selects CreatePin. The retained error UI cannot distinguish those
boundaries. No specific Keychain, entitlement, SDK or navigation defect is proven.

The optional `hasPin` observer receives only a fixed stage and category. It never
receives an Error, credential, account/service identifier or native response.
Original rejection and legacy false-on-error behavior remain intact, including
when the observer throws. Splash keeps its existing generic modal, Retry and
navigation behavior. Abandoned attempts emit nothing.

In development only, a current failed attempt emits one `console.info` line:

```text
KEEPER_STARTUP_ERROR stage=KEYCHAIN_READ category=NATIVE_CODE_NEG34018
```

This is an illustrative fixed marker, not an observed native status. Categories
contain only whitelisted native code labels or built-in error-name labels.
Code and name accessors are guarded; unknown values stay UNKNOWN. There is no
warning/error LogBox call, raw message, stack, arbitrary code, production log,
new credential operation, fallback, SDK option, native query or deadline change.

The existing bounded iOS compact-log parser accepts only a complete exact marker
in a valid own-process record. It regenerates at most 32 fixed facts and exposes
the cap. Rendered logs are not authenticated causal evidence. An absent marker
cannot establish that a boundary succeeded: actual native log routing and marker
visibility are unverified until a new exact-candidate hosted window runs.

Source checks cover the read boundaries, native-code and hostile-accessor privacy,
observer/logger faults, production silence, navigation exceptions, Retry and late
unmount behavior, plus foreign/malformed/capped log records. These are source
controls, not native acceptance or a correction of the observed startup failure.
The immutable `1bc` window and its Android continuation remain unchanged. No
personal Mac, native queue, release signing, upload or distribution is involved.
