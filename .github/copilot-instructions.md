# GitHub Copilot Instructions — Bitcoin Keeper

## Agent Routing

### change-engineer (custom agent)

All code changes — bugs and features — must go through the **change-engineer** custom
agent defined in `.github/agents/change-engineer.agent.md`.

**Do not make code changes directly.** When working on an issue or task:

1. The change-engineer agent is already active if it was selected in the UI.
   It handles the full OpenSpec workflow internally — you do not need to invoke it
   via `skill("change-engineer")` or any other tool. That call will fail.

2. The agent runs the following three steps in order. Each step is mandatory:
   - **Propose** — `openspec new change "<name>"`, generate artifacts, commit
   - **Apply** — work through `tasks.md` tasks, commit code changes
   - **Archive** — `openspec archive <name> --yes`, open PR

3. **Hard stop rule**: if the OpenSpec workflow cannot be started (CLI unavailable,
   missing files, etc.), stop and report the blocker. Do not fall back to direct code
   edits as a substitute for the workflow. Use the skill file fallbacks instead:
   - Propose: `.github/skills/openspec-propose/SKILL.md`
   - Apply:   `.github/skills/openspec-apply-change/SKILL.md`
   - Archive: `.github/skills/openspec-archive-change/SKILL.md`

## Commit Conventions

| Type      | Format                              |
|-----------|-------------------------------------|
| Spec      | `spec: add OpenSpec artifacts for <name>` |
| Feature   | `feat: <description>`               |
| Bug fix   | `fix: <description> closes #<N>`    |
| Archive   | `chore: archive <name>`             |

## OpenSpec Config

All project context, domain map, and hard rules are in `openspec/config.yaml`.
Every artifact and code change must comply with the `context:` and `rules:` blocks
defined there.
