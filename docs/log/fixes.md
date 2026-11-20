# Fix / issue log

## FIX-001 — README chunked-upload endpoint name is wrong

**Severity:** Documentation mismatch (not a blocker)

**Found while reading:** README.md "Upload a file in chunks" section documents `POST /api/upload-chunks` (plural).

**Actual implementation:** `src/server/server.ts:59` registers `POST /api/upload-chunk` (singular).

**Resolution:** Code the client API against `/api/upload-chunk` (singular) to match the server. Documented in ADR-001.

**Verified by:** Comparing README.md lines 117-149 with `src/server/server.ts:59-60`.

---

## FIX-002 — Server-side multer v2 `originalName` vs `originalname` bug

**Severity:** Runtime bug (affects file uploads)

**Found while reading:** `src/server/server.ts:47,69,78` uses `req.file.originalName` to access the uploaded filename.

**Actual implementation:** multer v2 (`^2.0.0-rc.4`) exposes `originalname` (lowercase `n`), not `originalName`. `req.file.originalName` is always `undefined` at runtime.

**Impact:**

-   Single upload (`POST /api/upload-single`, line 47): file is saved as `undefined` instead of its real name.
-   Chunked upload (`POST /api/upload-chunk`, line 78): `if (!req.file.originalName)` is always true, so every chunk returns HTTP 400 "Missing filename".

**Resolution:** Not fixed — server-side anomaly outside the frontend scope of this task. Would fix by changing `req.file.originalName` to `req.file.originalname` in `src/server/server.ts`. Documented here for awareness.

**Verified by:** Comparing README.md lines 117-149 with `src/server/server.ts:47-78`.

---

## FIX-003 — No upload ID / idempotency key on retries

**Severity:** Design gap (affects retry reliability)

**Found while reviewing:** `src/client/api/filesApi.ts:16` sends `FormData` with just the file — no `Upload-Id` or `Idempotency-Key` header.

**Impact:** If a user clicks Retry after a failed upload, the client may resend the same file and the server may process it twice (duplicate on disk). There's no client-generated upload ID and no server-side dedup.

**Resolution:** Not fixed — requires server-side dedup store and client-generated UUID per upload attempt. Out of scope for the 4-hour take-home. Documented here for awareness. Could be added by:

1. Generating a `crypto.randomUUID()` per upload attempt in `FileUpload`
2. Sending it as an `Upload-Id` header with each request
3. Server storing processed upload IDs and returning 409 on duplicates
