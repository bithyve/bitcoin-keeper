### Requirement: Ingest release notes on publish
When a GitHub Release is published on the repository, the system SHALL automatically POST the release notes to the RAG ingestion endpoint without any manual intervention.

#### Scenario: Release published with body
- **WHEN** a GitHub Release is published with a non-empty body
- **THEN** the workflow POSTs to `/addRagChunk` with content equal to `"Bitcoin Keeper <tag_name>\n\n<release_body>"`, title equal to the release name, and metadata `{ type: "release_notes", version: "<tag_name>" }`

#### Scenario: Release published with empty body
- **WHEN** a GitHub Release is published with an empty body
- **THEN** the workflow still POSTs to `/addRagChunk` with content equal to `"Bitcoin Keeper <tag_name>\n\n"` and does not fail

### Requirement: Admin key kept secret
The RAG admin key SHALL never be hardcoded in workflow files or printed in workflow logs.

#### Scenario: Workflow runs with secret configured
- **WHEN** the `RAG_ADMIN_KEY` GitHub Actions secret is set
- **THEN** the workflow reads the key from the secret and passes it as the `admin-key` header without echoing it to logs

#### Scenario: Workflow runs without secret configured
- **WHEN** the `RAG_ADMIN_KEY` GitHub Actions secret is not set
- **THEN** the `curl` request fails with a non-200 response and the workflow step is marked as failed

### Requirement: Safe JSON construction
The workflow SHALL construct the JSON payload using a method that correctly handles multi-line text, double quotes, backticks, and other special characters in the release body.

#### Scenario: Release body contains special characters
- **WHEN** the release body contains double quotes, newlines, or backticks
- **THEN** the JSON payload is valid and the POST request succeeds without corruption

### Requirement: Retry on transient failure
The workflow SHALL retry the POST request up to 3 times on transient network failure before marking the step as failed.

#### Scenario: First attempt fails, second succeeds
- **WHEN** the first POST attempt returns a network error
- **THEN** the workflow retries and the step succeeds if a subsequent attempt returns 2xx

#### Scenario: All retries exhausted
- **WHEN** all 3 POST attempts fail
- **THEN** the workflow step is marked as failed and the GitHub Actions run shows a failure notification
