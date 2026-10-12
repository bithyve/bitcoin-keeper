# Bitcoin Keeper: Codex workflow

This repository uses a **ChatGPT → Codex Cloud → Codex Local (Mac)** workflow for coding tasks. The GitHub pull request is the durable handoff between stages. Do **not** rely on one agent having access to another agent's conversation, unpushed changes, machine, or installed tools.

Repository: `KeeperCommunity/bitcoin-keeper`. Use `sprint` as the PR base unless the task explicitly specifies another base.

## Codex Cloud: implement and prepare handoff

1. Work in a task-specific branch; investigate, implement, add or update tests, and run suitable checks (for example, `npm run test` and `npm run lint`). Report actual pass/fail results; do not claim a native simulator was run unless it really was.
2. Open or update a GitHub PR with the code changes. Preserve the user's existing work; never overwrite or silently discard another branch's changes.
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
   Local checks requested: <targeted iOS/Android simulator, native build, and/or physical-device scenarios>
   Risks / known gaps: <known limitations or 'none known'>
   ```

4. Return the PR URL/number and state `NEEDS_LOCAL` to the user so ChatGPT can generate the exact local handoff prompt. Continue unrelated cloud tasks while waiting for a Mac.
5. If a task needs only code review, explicitly state why local testing is not required rather than silently skipping it.

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
- ChatGPT is the coordinator: when the user shares a PR or asks for a handoff/status, inspect the latest PR details and comments; then provide the next exact copy-and-paste prompt for Cloud or Local Codex. ChatGPT should not claim to know Codex's private session state or that the Mac is currently available.
- If the Mac is offline, the state remains `NEEDS_LOCAL`; cloud work does not have to stop.
