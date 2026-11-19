# Plan

## Overview

Build a reusable and extensible React file upload component wired against the provided Express API. Small take-home challenge (~4 hours). Work in tiny, focused stages — each stage = one commit, one purpose.

Principles: DRY, SOLID, KISS, YAGNI. Conventional commits. Pre-commit gate (Husky) runs typecheck → lint → prettier → vitest.

## Stage breakdown (commits)

| Stage | Commit (one purpose)                                 | Est. time |
| ----- | ---------------------------------------------------- | --------- |
| 1     | `docs: add implementation plan`                      | 10 min    |
| 2     | `docs: add ADR for pre-commit conventions`           | 10 min    |
| 3     | `docs: log endpoint-name discrepancy fix`            | 10 min    |
| 4     | `chore: add pluggable UploadAdapter interface`       | 30 min    |
| 5     | `feat: add typed API client (fetch adapter)`         | 20 min    |
| 6     | `feat: FileUpload uploader component (single file)`  | 40 min    |
| 7     | `feat: FileList component`                           | 20 min    |
| 8     | `feat: accessibility (ARIA, keyboard, labels)`       | 30 min    |
| 9     | `feat: chunked upload + bulk + parallel options`     | 40 min    |
| 10    | `test: unit + integration tests`                     | 40 min    |
| 11    | `feat: demo page wiring upload + list`               | 30 min    |
| 12    | `feat: polish (error/loading/empty states) + verify` | 30 min    |

Total ≈ 4 hours.

## Stage 1 — `docs: add implementation plan`

**Context:** Product manager handoff — this document is the single source of truth for what gets built and in what order.

**Task:** This `docs/plan.md` file. Nothing else.

**Acceptance:** File exists and lists all stages.

---

## Stage 2 — `docs: add ADR for pre-commit conventions`

**Context:** We decided to use Husky + conventional commits + DRY/SOLID/KISS/YAGNI. Record the decision so it's visible in the repo.

**Task:** Create `docs/adr/ADR-001-project-conventions.md`. Nothing else.

**Acceptance:** ADR file exists.

---

## Stage 3 — `docs: log endpoint-name discrepancy fix`

**Context:** README says `POST /api/upload-chunks` (plural); server implements `POST /api/upload-chunk` (singular). We code against the server. Log it.

**Task:** Ensure `docs/logs/fixes.md` has FIX-001. Nothing else.

**Acceptance:** Fix log exists with the discrepancy noted.

---

## Stage 4 — `chore: add pluggable UploadAdapter interface`

**Context:** Component must not be tied to a specific API/technology (GraphQL, different endpoints, etc.).

**Task:** Add `src/client/api/UploadAdapter.ts` defining the adapter contract (upload(file) / listFiles()). No implementation yet.

**Acceptance:** Interface exists; typecheck passes.

---

## Stage 5 — `feat: add typed API client (fetch adapter)`

**Context:** Concrete implementation of `UploadAdapter` using native `fetch` against `GET /api/files`, `POST /api/upload-single`, `POST /api/upload-chunk` (singular, per server).

**Task:** Add `src/client/api/filesApi.ts` implementing the adapter. No UI yet.

**Acceptance:** Adapter compiles; typecheck passes.

---

## Stage 6 — `feat: FileUpload uploader component (single file)`

**Context:** Reusable uploader, usable without the file list. Single file, single endpoint by default (KISS).

**Task:** `src/client/components/FileUpload/FileUpload.tsx` — hidden input + label/button, FormData via injected adapter, states (idle/uploading/success/error). No file list coupled.

**Acceptance:** Component renders; typecheck + lint pass.

---

## Stage 7 — `feat: FileList component`

**Context:** Reusable list showing name/size with remove action. Independent of the uploader.

**Task:** `src/client/components/FileList/FileList.tsx`. Accepts `files` and `onRemove`.

**Acceptance:** Component renders; typecheck + lint pass.

---

## Stage 8 — `feat: accessibility (ARIA, keyboard, labels)`

**Context:** Meet accessibility standards.

**Task:** Add `<label>` association, `aria-busy`, `aria-label`, `aria-describedby`, `role="status"`, Enter/Space keyboard activation, focus management.

**Acceptance:** ARIA/keyboard present; tests pass.

---

## Stage 9 — `feat: chunked upload + bulk + parallel options`

**Context:** Performance for various file sizes. Opt-in, KISS default stays single-file.

**Task:** Extend adapter usage for chunked upload (`currentChunkIndex`/`totalChunks`), multiple files, bounded parallel chunks.

**Acceptance:** Options exist behind flags; typecheck + lint pass.

---

## Stage 10 — `test: unit + integration tests`

**Context:** Meaningful coverage of core behavior.

**Task:** Vitest tests for FileUpload (adapter calls, success/error, keyboard, ARIA) and FileList (render, remove). Mocked adapter.

**Acceptance:** `npm run test:client` passes.

---

## Stage 11 — `feat: demo page wiring upload + list`

**Context:** Minimal page integrating both components against the real API.

**Task:** Wire `FileUpload` + `FileList` into `src/client/App.tsx`.

**Acceptance:** Page renders; manual dev-server check passes.

---

## Stage 12 — `feat: polish (error/loading/empty states) + verify`

**Context:** Production-ready finish.

**Task:** Add inline error messages, loading states, empty state for file list. Run full verification: typecheck, lint, prettier, vitest client + server.

**Acceptance:** All checks pass; manual end-to-end upload + list confirmed.

## Acceptance criteria

-   [ ] Reusable `FileUpload` uploader (usable without `FileList`).
-   [ ] Reusable `FileList` component.
-   [ ] Pluggable `UploadAdapter` — not tied to a specific API/technology.
-   [ ] Upload via `POST /api/upload-single`; list via `GET /api/files`.
-   [ ] Accessible: labelled input, keyboard operable, ARIA states, focus management.
-   [ ] Extensible: chunked upload, bulk/parallel options.
-   [ ] Vitest tests covering happy path, errors, keyboard, ARIA.
-   [ ] `npm run typecheck`, `npm run lint`, `npm run test:client`, `npm run test:server` all pass.
-   [ ] Commits map one-to-one to the stages above.
