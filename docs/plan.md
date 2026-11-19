# Plan

## Overview

Build a reusable and extensible React file upload component wired against the provided Express API. Small take-home challenge (~4 hours). Work in tiny, focused stages — each stage = one commit, one purpose.

Principles: DRY, SOLID, KISS, YAGNI. Conventional commits. Pre-commit gate (Husky) runs typecheck → lint → prettier → vitest. Tests are added as I go — initial unit tests at Stage 10, then per-stage tests thereafter.

## Stage breakdown (commits)

| Stage | Commit (one purpose)                                             | Est. time |
| ----- | ---------------------------------------------------------------- | --------- |
| 1     | `docs: add implementation plan`                                  | 20 min    |
| 2     | `docs: add ADR for pre-commit conventions`                       | 2 min     |
| 3     | `docs: log endpoint-name discrepancy fix`                        | 1 min     |
| 4     | `chore: add Husky pre-commit gate`                               | 3 min     |
| 5     | `chore: add prettier ignore and gitignore updates`               | 1 min     |
| 6     | `chore: add pluggable UploadAdapter interface`                   | 10 min    |
| 7     | `feat: add typed API client (fetch adapter)`                     | 20 min    |
| 8     | `feat: FileUpload uploader component (single file + a11y)`       | 20 min    |
| 9     | `feat: FileList component`                                       | 10 min    |
| 10    | `test: initial unit tests on FileUpload + FileList + FilesApi`   | 20 min    |
| 11    | `git `                                                           | 30 min    |
| 12    | `feat: add UploadOptions to adapter interface (future chunking)` | 15 min    |
| 13    | `feat: polish + verify`                                          | 25 min    |

Total ≈ 3 hours.

## Stage 1 — `docs: add implementation plan`

**Context:** Product manager handoff — this document is the single source of truth for what gets built and in what order.

**Task:** This `docs/plan.md` file. Nothing else.

**Acceptance:** File exists and lists all stages.

---

## Stage 2 — `docs: add ADR for pre-commit conventions`

**Context:** I decided to use Husky + conventional commits + DRY/SOLID/KISS/YAGNI. Record the decision so it's visible in the repo.

**Task:** Create `docs/adr/ADR-001-project-conventions.md`. Nothing else.

**Acceptance:** ADR file exists.

---

## Stage 3 — `docs: log endpoint-name discrepancy fix`

**Context:** README says `POST /api/upload-chunks` (plural); server implements `POST /api/upload-chunk` (singular). I code against the server. Log it.

**Task:** Ensure `docs/logs/fixes.md` has FIX-001. Nothing else.

**Acceptance:** Fix log exists with the discrepancy noted.

---

## Stage 4 — `chore: add Husky pre-commit gate`

**Context:** Commits should be blocked until typecheck, lint, prettier, and client tests all pass. Configure once, runs automatically every commit.

**Task:** Install husky + lint-staged, init hooks, create `.husky/pre-commit` running `npm run precommit`, add `prepare` and `precommit` scripts to `package.json`.

**Acceptance:** `.husky/pre-commit` exists; `npm run precommit` passes end-to-end.

---

## Stage 5 — `chore: add prettier ignore and gitignore updates`

**Context:** Prettier shouldn't fail on pre-existing files outside our source.

**Task:** Create `.prettierignore` (flake.lock, README.md, node_modules, dist, build, uploads, uploads-chunks).

**Acceptance:** `npx prettier --check .` passes.

---

## Stage 6 — `chore: add pluggable UploadAdapter interface`

**Context:** Component must not be tied to a specific API/technology (GraphQL, different endpoints, etc.).

**Task:** Add `src/client/api/UploadAdapter.ts` defining the adapter contract (upload(file) / listFiles()). No implementation yet.

**Acceptance:** Interface exists; typecheck passes.

---

## Stage 7 — `feat: add typed API client (fetch adapter)`

**Context:** Concrete implementation of `UploadAdapter` using native `fetch` against `GET /api/files`, `POST /api/upload-single`, `POST /api/upload-chunk` (singular, per server).

**Task:** Add `src/client/api/filesApi.ts` implementing the adapter. No UI yet.

**Acceptance:** Adapter compiles; typecheck passes.

---

## Stage 8 — `feat: FileUpload uploader component (single file + a11y)`

**Context:** Reusable uploader, usable without the file list. Single file, single endpoint by default (KISS). Accessibility built in from the start, not bolted on later.

**Task:** `src/client/components/FileUpload/FileUpload.tsx` — hidden `<input type="file">` + `<button>`, FormData via injected adapter, states (idle/uploading/success/error). ARIA attributes (`aria-label`, `aria-busy`, `aria-describedby`, `role="alert"`). Native `<button>` keyboard activation (Enter/Space) — no redundant custom `onKeyDown` that could trigger double file-picker dialogs. No file list coupled.

**Acceptance:** Component renders; typecheck + lint pass; ARIA attributes present; keyboard operable.

---

## Stage 9 — `feat: FileList component`

**Context:** Reusable list showing name/size with remove action. Independent of the uploader.

**Task:** `src/client/components/FileList/FileList.tsx`. Accepts `files` and `onRemove`.

**Acceptance:** Component renders; typecheck + lint pass.

---

## Stage 10 — `test: initial unit + integration tests on FileUpload + FileList + FilesApi`

**Context:** Tests should exist alongside the code, not bolted on at the end. The pre-commit gate already runs `vitest src/client` on every commit, so tests must pass before anything else can be committed.

**Task:** Add Vitest tests for:

-   **Unit:** `FileUpload` — renders button/input, calls `adapter.upload()` with selected file, shows success/error, keyboard Enter/Space
-   **Unit:** `FileList` — renders empty state, renders files with name/size, calls `onRemove` on remove
-   **Unit:** `FilesApi` — mocked `fetch`, upload success/failure, list files
-   **Integration:** `FileUpload` + `FileList` wired together with a mocked `UploadAdapter` — user selects a file, adapter returns success, file appears in the list

Use mocked `UploadAdapter` for component tests, mocked `fetch` for API client.

**Acceptance:** `npm run test:client` passes.

---

## Stage 11 — `feat: demo page wiring upload + list`

**Context:** Minimal page integrating both components against the real API.

**Task:** Wire `FileUpload` + `FileList` into `src/client/App.tsx`.

**Acceptance:** Page renders; manual dev-server check passes.

---

## Stage 12 — `feat: add UploadOptions to adapter interface (future chunking)`

**Context:** The `UploadAdapter` interface should be ready for chunked upload, bulk uploads, and parallelization without breaking `FileUpload`. These were intentionally scoped out for the 4-hour timebox but documented as future work.

**Task:** Extend `UploadAdapter.ts` with `UploadOptions` type (`chunkSize`, `concurrency`, `onProgress`) and optional `uploadBulk()` method. Update `FilesApi.upload()` to accept `options?` (ignored today, with TODO comments marking where chunking logic goes). Update `FileUpload` to accept and pass through `chunkSize`/`concurrency`/`onProgress` props.

**Acceptance:** Interface compiles; `FileUpload` still renders with single-file default; typecheck + lint pass; tests pass.

---

## Stage 13 — `feat: polish (error/loading/empty states) + verify`

**Context:** Production-ready finish.

**Task:** Run full verification: typecheck, lint, prettier, vitest client.

**Acceptance:** All checks pass; manual end-to-end upload + list confirmed.

## Acceptance criteria

-   [x] Reusable `FileUpload` uploader (usable without `FileList`).
-   [x] Reusable `FileList` component.
-   [x] Pluggable `UploadAdapter` — not tied to a specific API/technology.
-   [x] Upload via `POST /api/upload-single`; list via `GET /api/files`.
-   [x] Accessible: labelled input, keyboard operable, ARIA states.
-   [x] Extensible: pluggable `UploadAdapter`, optional `UploadOptions` params (chunkSize, concurrency, onProgress).
-   [x] Vitest tests covering happy path, errors, keyboard, ARIA.
-   [x] `npm run typecheck`, `npm run lint`, `npm run test:client` all pass.
-   [x] Commits map one-to-one to the stages above.

---

## Trade-offs & Production Considerations (4-hour timebox)

### Scope kept intentionally small (KISS / YAGNI)

The core implementation ships single-file upload via `POST /api/upload-single` and file listing via `GET /api/files`. Chunked upload, bulk uploads, and parallelization were **considered but not implemented** in this take-home, for the following reasons:

-   The assignment explicitly says it's OK to cut corners and that the solution doesn't need to be fully featured — just well-structured and tested.
-   A ~4-hour timebox favors a clean, testable, accessible single-file flow over a half-baked chunking engine.

### How chunking / bulk / parallelization could be added later (architecture is ready)

The codebase is designed so these can be plugged in without touching `FileUpload`:

-   **`UploadAdapter` interface** (`src/client/api/UploadAdapter.ts`) already accepts an optional `UploadOptions` parameter (`chunkSize`, `concurrency`, `onProgress`) on `upload()`, plus an optional `uploadBulk()` method.
-   `FileUpload` passes those options through to `adapter.upload(file, options)` — defaulting to `undefined`, which means single-file behavior today.
-   `FilesApi` (`src/client/api/filesApi.ts`) has TODO comments marking exactly where chunking logic (split via `file.slice()`, POST each chunk to `POST /api/upload-chunk`, bounded concurrency pool) would go.

When adding chunking in production:

-   Inspect `src/server/server.ts:59` — the server implements `POST /api/upload-chunk`.
-   Files under a threshold (e.g., 5MB) should use single-upload; larger files split into chunks.
-   Chunks of a single file should upload sequentially (server reassembles in order); different files in a bulk upload can parallelize with a bounded concurrency pool (default 3) to avoid saturating connections.

### What was deliberately omitted

-   Exponential retry/backoff on failed chunks
-   Persistent chunk resume (client-side hashing, localStorage)
-   Web Workers for client-side file hashing/splitting
-   Drag-and-drop library (native `<input type="file">` used instead)

These can be revisited in a follow-up iteration.

### Deliberate Implementation Decisions

-   **Module-level `FilesApi` singleton in `useFileList.ts`** — `const api = new FilesApi()` is module-level, shared across hook instances. Intentional: single-instance app only; if the hook were ever reused in multiple components concurrently, it would need to be instantiated per-instance.
-   **`refreshFiles` not memoized** — Defined inline in the hook body; `useEffect` depends on `[]` so it never re-runs. `refreshFiles` being recreated each render is harmless and not worth `useCallback` given the module-level `api` singleton.
