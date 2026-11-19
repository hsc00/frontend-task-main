# ADR-002: Pluggable UploadAdapter interface

**Status:** Accepted

**Context:** The assignment requires the component must not be tied to a specific upload technology or API (endpoints can use different request/response types or even GraphQL).

**Decision:** `FileUpload` depends on an `UploadAdapter` interface (`upload(file) / listFiles()`) injected via props. `FilesApi` is one concrete implementation using native `fetch` against `POST /api/upload-single` and `GET /api/files`. The component knows nothing about `fetch`, `FormData`, or endpoint URLs.

**Consequences:**

-   Swapping upload technology (GraphQL, different endpoints, mock in tests) requires only a new `UploadAdapter` implementation — no UI changes.
-   Small upfront abstraction cost; justified by the pluggable-upload requirement.
