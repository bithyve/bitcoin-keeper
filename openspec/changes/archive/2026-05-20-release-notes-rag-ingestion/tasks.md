## 1. Repository Secret

- [ ] 1.1 Add `RAG_ADMIN_KEY` as a GitHub Actions repository secret (Settings → Secrets and variables → Actions → New repository secret), using the live admin key value

## 2. Workflow File

- [x] 2.1 Create `.github/workflows/rag-ingest-release.yml` with trigger `on: release: types: [published]`
- [x] 2.2 Add a single job `ingest` running on `ubuntu-latest`
- [x] 2.3 Add a step that reads `github.event.release.tag_name`, `github.event.release.name`, and `github.event.release.body` into environment variables
- [x] 2.4 Use `jq -n --arg` to construct the JSON payload with enriched content (`"Bitcoin Keeper <tag>\n\n<body>"`), title, and metadata (`type`, `version`)
- [x] 2.5 Add `curl --fail --retry 3 --retry-delay 5` POST to `https://relay.bitcoinkeeper.app/addRagChunk` with `Content-Type: application/json` and `admin-key: $RAG_ADMIN_KEY` headers

## 3. Verification

- [ ] 3.1 Manually trigger a test by creating a draft release and publishing it; confirm the workflow runs and the GitHub Actions log shows a 2xx response from the RAG endpoint
- [ ] 3.2 Confirm the admin key does not appear anywhere in the workflow run logs
