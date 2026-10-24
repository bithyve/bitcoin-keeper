# Android same-button Skip-label diagnostic

Frozen bea (#7154/run40078818062/a1) passed Android build, startup, native persistence and scoped worker probes, then its first product sample failed ASSERT_VISIBLE start_new_tile after the host acknowledged skip_tapped. The exact-byte #7156 readout40084255557 recovered one owned ONBOARDING_EFFECT, with Skip/reset/NewKeeper stages unknown. A bound post-assertion snapshot retains an enabled/clickable Skip node spanning(0,78)-(1038,134); tap coordinates and user visibility were not recorded. This does not establish a product cause or prove a failed press.

The source OnBoardingSlides.tsx uses a full-row TouchableOpacity with testID btn_skip and right-aligned Skip text plus icon. Pinned Maestro2.11 defaults an element tap to its bounds center. This diagnostic changes only the Android intended Skip target to the deepest matching visible Skip label inside the same btn_skip subtree. Text matching is full-string and does not trim nonbreaking spaces, so the anchored regex accepts only Skip followed by ASCII spaces or U+00A0 from the source label. It rejects Skip Backup, Skip for Now and unrelated text. If accessibility merges all text onto the parent and omits descendants, it may still select parent bounds; native execution must measure the outcome. This is a harness hypothesis, not a proved app fix.

Pinned source at c8c361be1cc89b2e742f185466a302a22778be6b:
- [childOf model](https://github.com/mobile-dev-inc/Maestro/blob/c8c361be1cc89b2e742f185466a302a22778be6b/maestro-orchestra/src/main/java/maestro/orchestra/yaml/YamlElementSelector.kt#L27), [subtree lookup](https://github.com/mobile-dev-inc/Maestro/blob/c8c361be1cc89b2e742f185466a302a22778be6b/maestro-orchestra/src/main/java/maestro/orchestra/Orchestra.kt#L1435), [deepest matching filter](https://github.com/mobile-dev-inc/Maestro/blob/c8c361be1cc89b2e742f185466a302a22778be6b/maestro-orchestra/src/main/java/maestro/orchestra/Orchestra.kt#L1703).
- [default center tap](https://github.com/mobile-dev-inc/Maestro/blob/c8c361be1cc89b2e742f185466a302a22778be6b/maestro-orchestra/src/main/java/maestro/orchestra/Orchestra.kt#L1338), [text matching](https://github.com/mobile-dev-inc/Maestro/blob/c8c361be1cc89b2e742f185466a302a22778be6b/maestro-orchestra/src/main/java/maestro/orchestra/Filters.kt#L58).
- [platform-conditional inline flow fixture](https://github.com/mobile-dev-inc/Maestro/blob/c8c361be1cc89b2e742f185466a302a22778be6b/maestro-test/src/test/resources/096_platform_condition.yaml), [branch execution](https://github.com/mobile-dev-inc/Maestro/blob/c8c361be1cc89b2e742f185466a302a22778be6b/maestro-orchestra/src/main/java/maestro/orchestra/Orchestra.kt#L1016).

Complementary platform branches select one intended Skip command. Existing
Maestro tap-engine defaults remain; this does not claim a physical-touch count. iOS retains its original id-only tap. Existing PIN steps, all ten progress markers, the Start New assertion/deadline, first-wallet/backend request counts, five samples, retry fixture, worker/installed-byte checks and downstream companion acceptance are unchanged. No product source, dependency, release setting or credential migration changes. Original failures remain failed, and no native result has been measured on this source.

## Explicit Android-only scheduling

The keeper/android-diagnostic-only modifier plus keeper/native-diagnostic skips this diagnostic workflow's iOS job and runs Android via its existing always() dependency. The modifier alone starts no app job. Default both-platform serialization and existing iOS-only behavior remain. Both platform-only modifiers together schedule no app or driver-preflight job; the preflight live guard also rejects that conflict. The independent driver-preflight label otherwise retains its explicit opt-in behavior.

| Native diagnostic | iOS-only | Android-only | App jobs selected |
| --- | --- | --- | --- |
| No | Either | Either | None |
| Yes | No | No | iOS then Android |
| Yes | Yes | No | iOS only |
| Yes | No | Yes | Android only |
| Yes | Yes | Yes | None |

All sixteen combinations including the driver-preflight label are covered by selection controls. Same-repository/current-head guards, read-only permissions, R4 exclusion, shared worker, canonical/full acceptance requirements, privacy and exact installed-byte proofs remain. This schedules diagnostics only and grants no trusted acceptance or platform waiver. The coordinator may select separate immutable Android-only and iOS-only sources on separate cloud VMs under the user's parallel-work instruction; evidence remains source-specific and passes must never be combined. No execution labels, publication or native dispatch were performed by this preparation.

## Source validation

The targeted product receipt/PIN flow suite passed33Python controls, including one selected Skip command per supported platform, exact preservation of the remaining actions/markers/assertions and rejection of unrelated Skip labels. Diagnostic/draft/source-identity policy controls passed29Node tests, including all sixteen label combinations and a live preflight conflict rejection. Both diagnostic and unchanged reusable worker workflows passed actionlint1.7.12; shellcheck/pyflakes are unavailable locally. Diff checks and unchanged app/native/dependency/shared-worker/product-runner/full-flow fences passed. Independent review and native execution are pending.
