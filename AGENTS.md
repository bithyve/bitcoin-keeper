# Bitcoin Keeper: Codex workflow

This repository uses a **ChatGPT → Codex Cloud → Codex Local (Mac)** workflow for coding tasks. The GitHub pull request is the durable handoff between stages. **Claude Sonnet 5.5 performs one independent, advisory code review after Cloud Codex finishes and before the local validation handoff.** Do **not** rely on one agent having access to another agent's conversation, unpushed changes, machine, or installed tools.

Repository: `KeeperCommunity/bitcoin-keeper`. Use `sprint` as the PR base unless the task explicitly specifies another base.

## Codex Cloud: implement and prepare handoff

1. Work in a task-specific branch; investigate, implement, add or update tests, and run suitable checks (for example, `npm run test` and `npm run lint`). Report actual pass/fail results; do not claim a native simulator was run unless it really was.
2. Create the PR as **draft** while coding, review, and tests are still underway. After the final Cloud changes and tests, update the handoff with the exact PR head SHA and mark the PR **ready for review**. This triggers the budget-limited Claude review once. Do not repeatedly mark it ready without meaningful new code to review. Preserve the user's existing work; never overwrite or silently discard another branch's changes.
3. Before asking for local testing, add a section named **Codex local handoff** to the PR description (or a fresh PR comment), using this format:

   ```text
   ## Codex local handoff
   State: NEEDS_LOCAL
   PR: #<number>
   Base: sprint
   Head branch: <branch>
   Head commit: <full SHA>
   Goal and acceptance criteria: <concise description>
   Changes made: <concise description>
   Cloud checks: <commands and exact pass/fail/not-run outcomes>
   Required local checks: IOS, ANDROID
   Local checks requested: <targeted iOS/Android simulator, native build, and/or physical-device scenarios>
   Risks / known gaps: <known limitations or 'none known'>
   ```

4. For app/code changes, `Required local checks` must list one or more of `IOS`, `ANDROID`, `HARDWARE` (comma-separated). Use both iOS and Android for cross-platform changes; add hardware for signer/device interactions. If no Mac tests are necessary, explain why, but the GitHub gate exempts only documentation and `.github/` changes. The handoff must name the actual PR head commit SHA after the final cloud push.
5. After the PR is ready, check its latest **Independent Claude review** comment and verify it refers to the current commit. Treat findings as actionable input, not as human or merge approval. Fix significant issues before Mac handoff, or clearly flag unresolved concerns. If fixes change the head SHA and a fresh review is needed, switch the PR to draft and then ready again **once**, after fixes are complete. Report review failures or missing results honestly.
6. Return the PR URL/number and state `NEEDS_LOCAL` to the user so ChatGPT can generate the exact local handoff prompt. Continue unrelated cloud tasks while waiting for a Mac.
7. If a task needs only code review, explicitly state why local testing is not required rather than silently skipping it.

## Codex Local (Mac): validate the PR

When given **"Validate Keeper PR #<number>"**, first read the newest **Codex local handoff** section and inspect the PR head SHA.

1. Fetch the PR branch into a separate worktree or another safe checkout. Never reset, clean, or overwrite uncommitted user changes.
2. Verify the exact tested commit. Perform the **requested** native build and simulator/emulator scenarios using the available local tools. The repo defines an iPhone simulator script (`npm run ios`), Android development script (`npm run androidDevelopmentDebug`), and Jest tests. Do not assume signing credentials, device access, or an emulator are configured.
3. Run relevant regression checks and record outcomes. If hardware-wallet, NFC, USB, camera, or real-device behaviour matters, distinguish physical-device tests actually performed from tests requiring a person/device.
4. If bugs are found, make targeted fixes on the PR branch when permitted, push those changes, and retest the new SHA.
5. Leave a PR comment in this format:

   ```text
   ## Codex local validation
   State: LOCAL_PASSED | LOCAL_FAILED | BLOCKED
   Tested commit: <full SHA>
   iOS build/simulator: <pass/fail/not run + details>
   Android build/emulator: <pass/fail/not run + details>
   Real devices/signers: <pass/fail/not run + details>
   Other checks: <commands and outcomes>
   Open issues / next action: <concise next step>
   Release readiness: <ready for review / not ready>
   ```

6. Report the result and PR link to ChatGPT/the user.

## Release safety and coordination

- `LOCAL_PASSED` means only the reported checks passed on the reported commit. It is **not** approval to merge, sign, distribute, upload to TestFlight/Play Store, or publish a release.
- Release operations require **explicit user approval** for the intended build, environment, and distribution channel.
- ChatGPT is the coordinator: when the user shares a PR or asks for a handoff/status, inspect the latest PR details, independent Claude review comment, and local validation comments; then provide the next exact copy-and-paste prompt for Cloud or Local Codex. ChatGPT should not claim to know Codex's private session state or that the Mac is currently available.
- If the Mac is offline, the state remains `NEEDS_LOCAL`; cloud work does not have to stop.

## GitHub merge gate

The `.github/workflows/keeper-local-validation.yml` workflow posts commit status `keeper/local-validation` for the current PR head SHA. For code changes, it remains failing until a repository collaborator posts a `Codex local validation` comment with `State: LOCAL_PASSED`, the **exact current commit SHA**, and `pass` for every platform named by `Required local checks`. New commits invalidate previous local sign-off. Documentation and `.github/`-only PRs are exempt from Mac tests.

This workflow **reports** a status; to **enforce** it, repository administrators must require the `keeper/local-validation` commit status for merges to `sprint` in GitHub Rulesets or branch protection. Require the existing `Tests` CI check as well. This is a review/test gate, not a guarantee that tests were actually executed; agents must report actual results truthfully. Release signing, TestFlight, Play Store, and production deployment remain separate and require explicit user approval.

## Independent AI code review

The `Keeper independent Claude review` workflow uses Anthropic Claude Sonnet 5.5 on **ready, same-repository PRs targeting `sprint`**. It is an advisory reviewer, **not** a required human approval or merge status. It runs when a PR opens ready, reopens, or transitions from draft to ready, but not after every push. Codex Cloud should hold the PR as a draft until code and Cloud tests are complete. If changes follow review, coordinate a single fresh ready-for-review transition for the completed update. The review reports the tested head SHA. Small budget and turn limits prevent review loops; a truncated review must be reported as incomplete, not passed. Do not retain automatic GitHub Copilot reviews after Claude has been verified and the old Copilot ruleset has been disabled. Avoid scheduling both AI reviewers by default.
