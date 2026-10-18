# Actual workflow validation before publication

Candidate branch: codex/native-workspace-literal-once-bccb6334.
This correction replaces the rejected workflow-level defaults.run working-directory
expression with literal `.`. At workflow scope, contexts/expressions are forbidden
in defaults.run. The prior local YAML parser and behavioral fixture did not enforce
that restriction. It is now covered by an actual Actions linter regression.

## Tool provenance

Official upstream release: https://github.com/rhysd/actionlint/releases/tag/v1.7.12
Release asset: actionlint_1.7.12_linux_amd64.tar.gz
Archive SHA256: 8aca8db96f1b94770f1b0d72b6dddcb1ebb8123cb3712530b08cc387b349a3d8
Published checksum-list SHA256: 433028cf0ba3c42163ea1a668dedce30fcdbe84fe912b1a5e288c006eab8a4f5
Extracted binary SHA256: c872d6db8c6bf83a8eaa704fc93999f027d55dffbc63b8a6abdccb47df5f4cd4
Both downloaded assets matched release API digests; archive also matched the
published checksum list before extraction/execution. Version output:1.7.12,
installed by downloading from release page, go1.26.1,linux/amd64.
Tool stays in /tmp; no app dependency, hosted setup or permission change.

## Actual validation

Ran actionlint -color=false on BOTH complete files:
.github/workflows/keeper-one-time-native-diagnostic.yml
review-only/keeper-native-validation/diagnostic.proposed.yml
Exit0, no diagnostics, no ignores/suppressions or disabled rules.

Negative control is the actual rejected workflow from published commit
210fb5768d21ce2a0294e369155a9a6968429e43. The same tool exits1 and reports the
unavailable github context in global defaults.run working-directory at line88.
Thus the tool detects the exact hosted failure class, not only YAML syntax.

The two cases are committed in test_workflow_schema.py. Set KEEPER_ACTIONLINT to
the verified absolute binary path; the tests check its SHA256 before use. Missing
tool explicitly skips schema tests with NOT RUN text; it must not be described as
schema validation success. With the tool supplied,84 tests pass with zero skips.
This is full actionlint workflow/schema/expression validation, not a claim that the
GitHub service has executed the corrected workflow. No hosted run took place.

## Independent context and layout review

All expression-bearing keys were individually inspected against GitHub's context
availability table:
- jobs.ios.if: github repository/ref/event/run-attempt/workflow-SHA predicates allowed.
- jobs.ios.steps[*].with.ref: github.workflow_sha allowed.
- jobs.ios.steps[*].env.KEEPER_PROVENANCE_TOKEN: github.token allowed (three steps).
All other workflow keys are literal. Dollar-prefixed values inside run scripts are
shell variables, not Actions expressions. Global defaults.run is entirely literal.
References:
https://docs.github.com/en/actions/reference/workflows-and-actions/contexts#context-availability
https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#defaultsrun

Root app checkout precedes pinned nested input checkouts. Inputs are moved outside
the app before clean-tree/staging guards, with existing destination refused. Pinned
checkout removes credentials before relocation; post cleanup does not delete moved
inputs. Absolute quoted script paths and relative cwd `.` retain workspace-root
semantics. Exact source/tree/harness/setup pins, sole parent, first-created/attempt1,
public standard macos-15 eligibility, contents:read,30-minute job/24-minute prepare,
root runtime verification, unchanged locks and final provenance/failure gates remain.
No new trust settings, build, smoke, artifacts, lock repair or publication.
