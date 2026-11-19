# ADR-001: Project conventions — pre-commit quality gates

**Status:** Accepted

**Context:** The codebase has no pre-commit quality gate. Typecheck, lint, Prettier formatting, and client tests run only when manually invoked, so broken or unformatted code can be committed.

**Decision:** Add Husky with a `pre-commit` hook that runs `npm run typecheck`, `npm run lint`, `npx prettier --check .`, and `npm run test:client`. If any step fails, the commit is aborted. Configuring this once takes about 5 minutes and is time recovered every commit since the checks run automatically; forgetting to run them manually no longer matters because they always run. It also ensures the whole team follows the same rules, allowing better organization. Commits follow conventional commit rules, and development adheres to DRY, SOLID, KISS, and YAGNI principles.

**Consequences:**

-   Commits are blocked until typecheck, lint, formatting, and client tests all pass.
-   Husky and lint-staged are added as devDependencies.
-   `.husky/pre-commit` is created and committed to the repo.
-   `package.json` gains a `prepare` script (`husky install`) and a `precommit` script aggregating the checks.
-   First-time setup requires `npm install` to install Husky's Git hooks.
