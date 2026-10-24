# Post-clearState failure observations

Frozen diagnostic source `bea6056724dd75d1db99f4ce394ba4896edd10bf`
observed an iOS `LAUNCH_APP` failure after Maestro's clear-state/reinstall,
permission-return and owned `simctl launch` invocation markers. The retained
FBS/operation flags do not identify an underlying error code or rejection cause.
The build/signature and initial installed-byte checks preceded Maestro's
clear-state replacement. They do not prove the replacement's integrity.

This continuation adds only read-only failure observations. Before simulator
cleanup, it queries the exact owned current app container, reuses the existing
strict typed bundle inventory and compares every entry and executable to the
built app. It checks the current instance with `codesign --verify --deep
--strict`, observes ad-hoc identity, and compares complete typed effective
entitlements to the unchanged simulator signing policy. It also counts internal
links without exporting their targets. No bundle transformation is accepted as
equivalent. The existing container admission policy is extracted unchanged and
used by both the original acceptance comparison and this observer.

The final container path and inventory must still match the inspected instance,
and the built artifact must still match the recorded input. A changed container,
inventory or built artifact discards conclusions. Missing, rejected, unsupported,
timed-out and unavailable inputs remain explicit unknown/query states. A
nonzero signature command means `NOT_VERIFIED`, not a diagnosed signing cause.
All tool output stays in unnamed private files with bounded reads and 20-second
query deadlines; the files close on success and failure. Paths, identifiers,
PIDs, plist values, signature text and error messages are not exported.

The existing bound command reader additionally projects up to eight distinct
domain/integer pairs from exact simctl top/underlying error headers in a recorded
failed owned `LAUNCH_APP`. Only the reviewed Apple/OS domain vocabulary and
signed 32-bit integer codes leave the runner. Descriptions are discarded;
unsupported domains, syntax, conflicting shapes or overflow supply `UNKNOWN`
without partial pairs. These codes are observations, not interpreted causes.

Pinned Maestro's Java copy algorithm does not preserve symlink identity in all
cases. Whether this actual app contained affected links, whether its replacement
changed, and why launch was rejected remain unknown until measured. This source
does not change signing, app code, the startup flow or timeouts; it performs no
retry or extra launch. The original failed smoke remains failed even if every
new observation succeeds or the observer itself fails. Initial installed-byte
metadata is not promoted or overwritten by this collector.

Host-side controls use real temporary trees and fake read-only tools. Native
execution on this continuation is **NOT RUN**. The coordinator owns candidate
selection and the next isolated cloud-native window. No protected-base trust,
physical-device result, signing/distribution permission or release authority is
provided by these diagnostics.
