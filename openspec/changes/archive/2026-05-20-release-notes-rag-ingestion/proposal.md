## Why

The AI Chat feature in Bitcoin Keeper relies on a RAG (Retrieval-Augmented Generation) database to answer user questions accurately. Currently, the RAG has no knowledge of app release history, so the AI cannot answer questions about new features, bug fixes, or changes introduced in recent updates. Every new app release leaves the AI knowledge base stale without a manual ingestion step.

## What Changes

- A new GitHub Actions workflow (`.github/workflows/rag-ingest-release.yml`) is added that triggers automatically whenever a GitHub Release is published on the repository.
- On trigger, the workflow fetches the release tag and body from the GitHub event context, enriches the content with a version header, and POSTs it to the RAG ingestion endpoint (`relay.bitcoinkeeper.app/addRagChunk`).
- The `LIVE_ADMIN_KEY` is stored as a GitHub Actions secret (`RAG_ADMIN_KEY`) and never hardcoded.
- The workflow uses `jq` for safe JSON construction (handles multi-line markdown, quotes, special characters in release bodies) and `curl --retry 3` for resilience against transient network failures.

## Capabilities

### New Capabilities

- `rag-release-ingestion`: Automated ingestion of GitHub Release notes into the RAG database on every published release, keeping the AI Chat knowledge base current with the latest app changes.

### Modified Capabilities

_(none — no existing spec-level behaviour changes)_

## Impact

- **Files added**: `.github/workflows/rag-ingest-release.yml`
- **No app code changes**: This is a pure CI/CD automation change; zero impact on the React Native codebase, Redux store, or any mobile runtime behaviour.
- **External dependency**: `relay.bitcoinkeeper.app/addRagChunk` endpoint (already live).
- **GitHub secret required**: `RAG_ADMIN_KEY` must be added to the repository's Actions secrets before the workflow is active.
- **Environment scope**: Neither mainnet nor testnet — this is infrastructure-only.
- **Hardware signer compatibility**: Not applicable.
- **Subscription tier gating**: Not applicable.
- **Security/privacy**: Admin key is never logged or printed; passed exclusively via GitHub secret → environment variable → `jq`-constructed payload. Release notes are already public (GitHub Releases page).

## Non-goals

- Backfilling historical releases into the RAG database.
- Parsing or extracting structured features arrays from release note markdown.
- Any changes to the in-app AI Chat UI or query logic.
- Transformation or summarisation of release notes (raw markdown body is used as-is, prepended with the version header).
