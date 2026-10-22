# iOS startup observation preparation

This bounded source package adds observations for a future exact-candidate
hosted startup run. It changes no app source, dependencies, entrypoint, SDK,
UI flow/assertion, timing marker, timeout, build budget or job scheduling.
It grants no native acceptance and arms no execution route.

On immutable `23f14e01f3437c213f1443c3167d96022f3a43bc`, run39846002094
attempt1/iOSjob120059314071 passed driver readiness, build, installation and
the full installed-byte comparison **before UI**. Startup then failed at the
Create-a-passcode assertion after232.6s. Artifact12456827499 ZIP SHA256 is
`96617d1fe5680464a841a97416e2b80eed03f88d9c36bb1252293ccd5a26d219`.
The retained receipt has2446 own-app compact records with a generic error
category and no fixed startup hierarchy selector. Its specific cause remains
unknown. The post-UI byte check and later feature/product phases did not run.
No result from that source transfers to this package.

Normal iOS startup now uses the existing supported CLI custom reporter and
middleware observer already used on Android. The observer requires the normal
Metro configuration and forwards its resolver, transformer, original reporter,
requests, response bodies, streaming and backpressure. It records only fixed
query options, build/error categories and outer HTTP statuses. App matching uses
the request's actual platform and that platform's committed development app ID.
An outer200 response does not establish multipart completion or app execution.

The existing failure-only compact-log query remains restricted to the built
executable on the fresh owned simulator. Its pure classifier exports fixed
record-category counts, generic and unclassified error counts, explicit bounds
and parse status. It reads at most1MiB,4096 lines/own records and16KiB per record;
incomplete, malformed, oversized, foreign and unprefixed continuation records
cannot supply an own-app error category. Categories are observed text markers,
not exception totals or a causal diagnosis. Empty, failed, missing or truncated
observations establish no pass or absence; cause remains `UNDETERMINED`.

iOS adds no process inventory, foreground/private SPI, crash dump, provider,
storage hook or additional log stream. Its capture handle supplies only the
host-side launch-window timestamp for Metro rows. No CPU/load value is used to
infer cause. Android's existing capture and device queries remain in place.

Only reconstructed fixed metadata leaves the ephemeral runner. Raw observer
and iOS error/stderr files are purged after collection. Cleanup attempts Metro
stop/output close, simulator shutdown/delete and each private-file purge even
when collection or receipt I/O fails. A primary UI/native failure stays primary;
unconfirmed cleanup fails the phase. Probe/features keep their existing separate
Metro configurations and acceptance prerequisites.

Offline privacy, malformed-input, platform/app identity, middleware/reporter,
actual smoke-finalizer and cleanup fault controls validate source behavior.
They are not native results. iOS/Android execution on this new source is
`NOT RUN`; coordinate a fresh exact candidate only after the existing serialized
native window ends. Physical/biometric checks remain separate and unrun.
