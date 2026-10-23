# Fixed 044 iOS startup readout

This is a read-only descendant of the fixed #7124 reader at
`60dd4582c6b5e7b983aeed9fa4d3abafc9835edc`. It retrieves only artifact
`12469536083` from run `39873063291`, attempt 1, iOS job `120151926152`.
The frozen application source is `044ebb6ea2d465f6a70e9116e3feac5a604cd696`,
tree `4856035ece888230674e061c53115de3d6f025ed`; workflow control is
`5a7b0c5da0a38197f6dd675ff424f3ba3f441d02` at `refs/pull/7131/merge`.
The original 7,232 ZIP bytes must match SHA-256
`e244015128d4aa72e1e1c8be3072bc70d506ba11a804067448122d1318621caf`.
No rewritten or reconstructed archive is acceptable.

The reader checks the live run, iOS job, original artifact, source tree and PR
head, then rechecks run/job/artifact after download. It accepts the already
allocated Android continuation while running or naturally completed. It never
reruns, cancels, labels or edits that work. A single private ZIP file is removed
before the reconstructed fixed-vocabulary receipt is printed. Original PID,
epoch, process messages, paths, arbitrary errors and signed URLs are excluded.
The diagnostic result never grants native acceptance or release authority.

## Actual observations before reading the ZIP

The decoded job logs were captured privately with mode 0600. Current diagnostic
source verification, driver readiness and development build steps succeeded.
The smoke reached the disposable passcode assertion, which failed on
`Create a passcode`. Native persistence, production-worker and product
measurement steps were skipped. The log's original bounded receipt reported:

- `NATIVE_CREDENTIAL_READ / REJECTED / Error`, native code `-34018`.
- One own process PID and one marker in the bounded launch window; no duplicate,
  malformed, foreign, outside-window or partial-input reasons.
- Metro errors empty; 36 bare bundle markers do not establish completion.
- Neither CreatePIN nor ConfirmPIN was present in the retained hierarchy signal.

Raw PID and compact timestamps are deliberately absent from the exported
receipt. Freshness here is the producer's marker epoch/window relation and
single own-process attribution, not an independent reconstruction of raw logs.
The original ZIP has not yet been decoded by this package. A direct `gh api`
download returned zero bytes and a private failure; no connector file-service
or alternate proxy route was used.

## Narrow causal investigation, not an app correction

RNKeychain 10.0.0's `getGenericPasswordForOptions` calls `SecItemCopyMatching`
and rejects statuses other than success/item-not-found through a decimal
NSString OSStatus. Its `errSecMissingEntitlement` case describes a missing
required entitlement. The observed code is consistent with that status.
The exact app call supplies a service without a custom access group. The hosted
build explicitly sets `CODE_SIGNING_ALLOWED=NO` and `CODE_SIGNING_REQUIRED=NO`.
These facts justify a development simulator signing comparison. They do not
justify changing Keychain error handling, treating unreadable credentials as
missing, or changing production capabilities.

Proposed separate hosted comparison, requiring source review before scheduling:

1. Wait for the active Android allocation to finish naturally. Use one hosted
   macOS/Xcode 16.4 window and exact reviewed simulator Debug app source.
2. Build with the current unsigned flags. Record actual signature absence or
   presence and actual entitlements with `codesign`, executable SHA-256, and the
   fresh simulator's ordinary startup result and original credential marker.
3. Ask Xcode to package the same build with `CODE_SIGNING_ALLOWED=YES`,
   `CODE_SIGNING_REQUIRED=NO`, `CODE_SIGN_IDENTITY=-` and empty
   `CODE_SIGN_ENTITLEMENTS=`. This requests simulator development ad-hoc signing
   and excludes the project's production capability file. Do not supply
   `-allowProvisioningUpdates`, identities, profiles, secrets or copied
   entitlement values. Preserve unsigned and signed artifact/executable hashes
   separately and identify the intentional development signing overlay: Mach-O
   signature bytes normally change. Do not claim byte or code equality. Record
   both exact Xcode invocations, effective configuration/source hashes and actual
   packaging outcomes; an opaque rebuild is not an unchanged-artifact proof.
4. Read back the actual Xcode signature and generated entitlements; do not
   synthesize application identifiers/access groups. Repeat ordinary startup
   on a second fresh owned simulator and retain only fixed status facts.
5. If Xcode cannot produce a usable simulator signature or the credential read
   still fails, record failure and stop. Only an observed unsigned/ad-hoc
   difference could support a later simulator-only harness correction.

This comparison has **NOT RUN**. No native job, signing operation, release
operation or source change to the frozen candidate is performed by this reader.
