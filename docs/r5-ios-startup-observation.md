# iOS startup observation preparation

The published #7116 preparation `76d1c949d91c5d885fc002f689a9ec321c16eafb`
starts from exact app source `23f14e01f3437c213f1443c3167d96022f3a43bc`.
That app source's hosted run39846002094 attempt1
passed driver readiness, unsigned development build, app installation and the
pre-UI installed-byte comparison, then failed to find Create a passcode. Native
persistence, production workers and product checks did not run on iOS. The
retained metadata has36 Metro bundle markers and2446 generic own-process log
records; those facts do not identify the startup failure. That combined window
and its serialized Android execution finished naturally. Their source and
results remain preserved.

This changes observation only. Normal iOS startup uses the existing Metro
middleware and CLI reporter observer already used for Android. Resolver,
transformer, serializer, middleware arguments, response streaming and the
original TerminalReporter remain intact. Fixed app enums distinguish the iOS
development bundle ID from Android's. An in-memory timestamp immediately before
the original Maestro command separates warmup rows from the app window. No
extra launch, install, CLI invocation, process sampler or native capture process
is introduced. The420s CLI deadline and startup flow are unchanged. Probe,
production-worker and full-product configurations are unchanged.

Both successful and failed startup retain regenerated fixed Metro facts and
bounded public hierarchy presence flags. Missing or invalid iOS observations
remain UNKNOWN. Outer HTTP200 does not establish multipart terminal success,
JavaScript execution or visible UI. The existing post-failure iOS log query keeps
its25s deadline and own-process compact-record filter. Its classifier adds fixed
JS, React/Objective-C, module/library, Hermes, bundle and network marker categories
with counts; unclassified errors and the generic fallback remain explicit.
Categories are observations, not failure-cause or crash proof. App PID/crash
state is not queried and remains UNKNOWN.

The shared reporter can emit at most512 rows per process. The iOS reader scans
at most1024 lines of bounded private input and exports at most512 valid rows.
It reports all three limits, scanned valid-row/export counts, byte/line
truncation and conservative coverage. Reaching512 valid rows means the producer
limit may have been reached; it does not establish how many observations were
lost. No coverage value claims a complete startup trace. Malformed category
containers and supplied non-object hierarchy attributes/non-list children
remain invalid/UNKNOWN rather than producing diagnostic facts.

A subsequent diagnostic-truth adaptation uses published76 as its base and
adopts compatible validation semantics from #7115 exact source
`eceb5551a430a0e31cff7a32d70181ee55007b69`. It is not a startup-cause or app
correction. Pure differential controls showed that76 could credit impossible
dates, unsupported severity, PID0/oversized PID, malformed TID and C0 controls as
own-process errors; vertical-tab splitting could turn message text into another
record. The port validates a complete compact prefix, actual date, supported
severity, positive bounded PID and hexadecimal TID, rejects control characters
apart from tabs, and scans newline-delimited records only. Valid Apple compact
records without a timezone and with bare hexadecimal TIDs remain supported.

The existing1MiB file-prefix bound is retained. The pure classifier also bounds
input to1MiB, individual records to16KiB and scanned lines/own records to4096.
It reports malformed/oversized/replacement/cap facts and UNKNOWN/PARTIAL/PARSED
parse state. PARSED describes supported bounded input, not a complete startup
trace, process liveness or authenticated log provenance. Reader and classifier
truncation are combined; failed or timed-out queries remain UNKNOWN and do not
classify their partial output. The original13 category names, counts, generic
fallback and observation state remain intact, including Hermes/ATS coverage.

On iOS only, future-dated Metro rows have UNKNOWN window attribution. Fixed
BUILD platform/dev/minify options are retained as enums/booleans/unknown values;
done/failed events do not inherit options from an earlier started event. Row
and request-options shapes are checked before projection. The stronger76
category-list validation, explicit512/1024 coverage and modern Login/LogBox
hierarchy flags remain intact. Android collector behavior/schema is unchanged.

The Login flags use exact23f English strings Enter your passcode and Welcome
Back. Credential-error and Retry are separate public flags; Retry alone does not
prove a credential error. Generic please wait/loading text belongs to the
Navigator loading overlay. Pending credential lookup has no dedicated public
loading marker, so its state cannot be inferred from missing flags.

Modern LogBox strings were read from the exact lock-pinned React Native0.83.9
npm tarball after SHA1 and SHA512 verification. SHA1 is
`61d2a4ccd89e06b98992c9b9781856ad88a09d39`. Fixed labels come from
`Libraries/LogBox/UI/LogBoxInspectorBody.js`, `LogBoxInspectorHeader.js` and
`LogBoxInspectorFooter.js`: Console Warning, Console Error, Uncaught Error,
Syntax Error, Render Error, Failed to compile, This error cannot be dismissed.,
Dismiss/Minimize, and the fixed Log-number-of-number shape. Error titles can be
overridden. React id maps to nativeID separately from testID; no assumption is
made that Maestro exposes modern LogBox IDs. Metro0.83.6 reporter events were
also checked against the lock-pinned tarball, SHA1
`1b42929143729d854c25a40f0568f955ba70895e`. Runtime client_log data is not added
to the observer.

Raw request URLs/bodies, UI text, stack traces, logs and credentials are never
exported. The same private observer files are purged by the existing cleanup;
only metadata is uploaded. Collection cannot replace the original UI failure.
Cleanup failures retain the existing fail-closed behavior. No app source,
dependency, selector, timeout, workflow, signing or release operation changes.

Offline controls verify fixed enum/privacy filtering, original middleware and
reporter forwarding, platform/window separation, missing/invalid data, public
hierarchy positives/negatives, own-process log attribution and classification,
one unchanged Maestro call, probe exclusion, original failure preservation and
cleanup. They provide no native acceptance. Hosted iOS validation of this
semantic port is NOT RUN; physical devices and signers are NOT RUN. The original
startup cause remains UNKNOWN. The published76 offline suites passed152 Node controls
and 224 Python controls; independent review cleared malformed category shapes,
malformed hierarchy fields and undisclosed row-cap coverage. Those are diagnostic
accuracy checks, not native evidence. No additional native window is selected
by this adaptation; publication and execution remain separately coordinated.

The combined diagnostic preparation, including failed-product observations,
passed 152 Node and 246 Python controls with zero failures or skips. Independent
review cleared both the iOS parser adaptation and product reader. App source,
dependencies, flows, workflows and deadline arguments remain unchanged from 23f.
