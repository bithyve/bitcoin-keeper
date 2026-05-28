## Context

Bitcoin Keeper's AI Chat feature is backed by a RAG (Retrieval-Augmented Generation) database hosted at `relay.bitcoinkeeper.app`. The database is populated via an authenticated HTTP POST to `/addRagChunk`. Currently there is no automated mechanism to ingest app release notes; the AI has no awareness of what changed in recent app updates.

GitHub Releases are the canonical source of release notes for this project. Each release has a tag name (e.g. `v2.5.12`), an optional title, and a markdown body written by the release author. The goal is to ingest that body into the RAG database the moment a release is published, with no manual steps required.

## Goals / Non-Goals

**Goals:**
- Automatically POST release notes to the RAG ingestion endpoint on every `release: published` GitHub event.
- Safely handle multi-line markdown release bodies (no shell injection or JSON corruption).
- Store the admin key exclusively as a GitHub Actions secret.
- Retry on transient network failures.

**Non-Goals:**
- Backfilling historical releases.
- Parsing structured feature arrays from markdown.
- Summarising or transforming release note content.
- Any changes to the mobile app or in-app AI Chat behaviour.

## Decisions

### 1. GitHub Actions `release: published` trigger (vs. tag push)

**Decision**: Trigger on `on: release: types: [published]`.

**Rationale**: The `release: published` event fires only when a release is explicitly published in the GitHub UI or via the API, guaranteeing the release body is fully written before the workflow runs. A bare `push: tags:` trigger fires when the tag is pushed, which may precede the release body being authored. Since release notes are the entire point of the ingestion, `release: published` is the only correct trigger.

### 2. Content format: version-enriched markdown (vs. raw body)

**Decision**: Prepend a version header to the release body before ingestion.

```
Bitcoin Keeper v2.5.12

<raw release markdown body>
```

**Rationale**: RAG vector embeddings match on content, not metadata. A user asking "what changed in 2.5.12?" needs the version string to be present inside the content being embedded. Metadata fields aid filtering but do not contribute to semantic similarity. Adding two lines to prefix the body costs nothing and meaningfully improves retrieval accuracy.

**Alternative considered**: Pass the raw body only — rejected because version number would not be in the embedded vector.

### 3. Safe JSON construction via `jq` (vs. shell string interpolation)

**Decision**: Use `jq --arg` to build the JSON payload; pass GitHub event values through environment variables, not inline `${{ }}` substitutions inside shell strings.

**Rationale**: Release bodies contain newlines, double quotes, backticks, and other characters that break naive shell string interpolation and corrupt JSON. Using `env:` to pull values into shell variables and `jq --arg` to construct the payload ensures all characters are properly escaped. This is also a security requirement — inline `${{ github.event.release.body }}` in a `run:` block is a known script injection vector (GitHub security advisory).

**Alternative considered**: `toJSON()` expression filter — would add `"` wrapping to the outer string; `jq` is cleaner.

### 4. `curl --retry 3` for transient failure resilience

**Decision**: Use `curl --fail --retry 3 --retry-delay 5` so the workflow retries up to three times with a 5-second backoff before failing.

**Rationale**: The RAG endpoint is an external service; a one-time network hiccup at release time should not require a manual re-run. Three retries with a short delay are sufficient for transient failures while not masking real errors.

### 5. Version prefix: keep `v` as-is (e.g. `v2.5.12`)

**Decision**: Use `github.event.release.tag_name` verbatim (e.g. `v2.5.12`) in both the content header and the metadata `version` field.

**Rationale**: Tags in this repo consistently use the `v` prefix. Stripping it adds complexity for no benefit; RAG metadata is not used for exact-match queries.

## Risks / Trade-offs

- **Release body is empty** → The workflow will still POST with only the version header as content. The RAG entry will be low-quality but harmless. Mitigation: release authors should be encouraged to always fill in the body.
- **`RAG_ADMIN_KEY` secret not configured** → The workflow will fail at the `curl` step with a 401. Mitigation: document the required secret in the PR description and repository README.
- **RAG endpoint is unavailable at release time** → After 3 retries, the workflow step fails and the GitHub Actions run is marked failed. The release is not blocked. Mitigation: the workflow failure is visible in GitHub Actions; a manual re-run is sufficient to re-ingest.
- **Release body contains characters that break `jq` in unexpected edge cases** → Extremely unlikely given `jq --arg` handles arbitrary UTF-8 strings; no known risk.

## Migration Plan

1. Add `RAG_ADMIN_KEY` as a GitHub Actions repository secret (value: the live admin key from the developer).
2. Merge the PR containing `.github/workflows/rag-ingest-release.yml` to the default branch.
3. The next published GitHub Release automatically triggers ingestion — no further manual steps.
4. **Rollback**: Disable or delete the workflow file. No data is deleted from the RAG; existing chunks remain.
