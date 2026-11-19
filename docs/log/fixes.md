# Fix / issue log

## FIX-001 — README chunked-upload endpoint name is wrong

**Severity:** Documentation mismatch (not a blocker)

**Found while reading:** README.md "Upload a file in chunks" section documents `POST /api/upload-chunks` (plural).

**Actual implementation:** `src/server/server.ts:59` registers `POST /api/upload-chunk` (singular).

**Resolution:** Code the client API against `/api/upload-chunk` (singular) to match the server. Documented in ADR-001.

**Verified by:** Comparing README.md lines 117-149 with `src/server/server.ts:59-60`.
