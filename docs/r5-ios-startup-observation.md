# iOS startup observation preparation

This isolated preparation starts from exact source
`23f14e01f3437c213f1443c3167d96022f3a43bc`. Its hosted run39846002094 attempt1
passed driver readiness, unsigned development build, app installation and the
pre-UI installed-byte comparison, then failed to find Create a passcode. Native
persistence, production workers and product checks did not run on iOS. The
retained metadata has36 Metro bundle markers and2446 generic own-process log
records; those facts do not identify the startup failure. The active combined
window and its serialized Android execution remain untouched.

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
preparation is NOT RUN; physical devices and signers are NOT RUN. The original
startup cause remains UNKNOWN. The final offline suites passed 152 Node controls
and 224 Python controls; independent review cleared malformed category shapes,
malformed hierarchy fields and undisclosed row-cap coverage. Those are diagnostic
accuracy checks, not native evidence. No additional native window is selected
by this preparation.
