# Startup observation reconciliation A: app transport

This package preserves both producer ancestries: [#7129](https://github.com/KeeperCommunity/bitcoin-keeper/pull/7129)
`cd9d50a80bdd9035b532604bd10bcfeb21fe484e` and [#7131](https://github.com/KeeperCommunity/bitcoin-keeper/pull/7131)
`e34331083959c94b5f0a17603d8c1f578305c474`. Its fixed source-review baseline
`4b6cabc55a82d4f9d200a97db137202d01236e82` has those two parents and exactly
the already reviewed #7129 tree. That join is not a native/release candidate;
selected #7131 work is exposed across this app package A and successor B.
Full new changed code/test text across both packages is approximately18.3k
characters/4 tokens before final formatting; per-package estimates and exact
commits belong in their handoffs. Existing producer PRs remain review links.

A selects exactly one development-only direct native hook from #7131 and adds
#7129's current-attempt/unmount guard. The old console.info emitter is removed.
Its old pure classifier remains temporarily because the unchanged canonical
parser's source-vocabulary controls still use it. It emits no log and is not
called by the app. Successor B removes it and connects the V1 collector to the
canonical parser; A alone does not claim V1 fixed-receipt collection.

The original1bc iOS window built/installed successfully and failed Create a
passcode. [The exact artifact readout](https://github.com/KeeperCommunity/bitcoin-keeper/pull/7123)
retained credential-error and Retry flags in one snapshot. Its616 own-process
error records contain18 CONNECTION markers and598 unclassified records. Neither
the snapshot nor those categories identify a Keychain/navigation cause. The
original source and evidence remain immutable; no pass transfers to this source.

The optional second `hasPin` callback receives only fixed phase/outcome/error-name
values and an optional numeric code. Only the original native-read rejection may
retain a canonical ASCII decimal-string signed int32 code. Guarded getters never
forward the original error, message, stack, credential, service/account identifier
or native response. No observer means no error-property inspection. Original
rejection identity, legacy false-on-error semantics, read count/service choice,
modal, Retry, success navigation and cleanup remain intact. Navigation failures
have their own phase after the original read. Abandoned attempts emit nothing.

A current development failure emits one direct Error-level3 hook call, such as:

```text
KEEPER_STARTUP_FAILURE_V1|1500|NATIVE_CREDENTIAL_READ|REJECTED|Error|-34018
```

This is illustrative grammar, not an observed native code. No console/LogBox call
or production observer is introduced. Pinned RN0.83.9 source supports the direct
Error sink. Actual hosted transport and marker visibility remain UNVERIFIED.
There is no SDK, selector, query, deadline, dependency or acceptance change in A.

Source controls cover original results/errors, every read boundary, hostile
getters, observer/sink faults, production silence, navigation, Retry and late
unmount. A does not correct the observed app failure or establish native,
backend, physical-device or release acceptance. No native window is queued.
The complete collection/privacy/ambiguity controls are a separate successor B,
which must be reviewed and integrated before the next combined diagnostic source.
