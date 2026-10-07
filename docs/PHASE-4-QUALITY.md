# Phase 4 quality baseline

This document records the risk-based test strategy and automated release gates for Kowsar. It covers the Angular repository at `C:\Angular\Panel\kowsarPanel` and the ASP.NET Core repository at `C:\Users\milad\source\repos\miladmfz\KitsApi`.

## Verified starting point

The Phase 4 audit started from a clean test result over the existing dirty worktrees:

- Angular typecheck passed and `72/72` tests passed.
- Backend Release tests passed `148/148`.
- A diagnostic backend coverage run reported `40.06%` line coverage and `22.29%` branch coverage.
- Angular's existing Karma builder completed `--code-coverage` successfully but did not emit a coverage artifact. No percentage is claimed for Angular.

The repository is a large legacy application, so Phase 4 uses risk-based coverage rather than adopting a misleading global percentage threshold. New regression coverage is required for authentication, authorization, runtime configuration, interceptors, sensitive operations, and every important bug fix.

## Coverage gaps closed

| Risk boundary | Automated evidence |
| --- | --- |
| Login and OTP | `login.component.spec.ts` covers incomplete forms, Kowsar login, customer OTP verification, session storage handoff, permissions, navigation, and permission failure. |
| Token, refresh, logout, and session | Frontend token tests cover rotation, single-flight refresh, logout, and missing credentials. Interceptor tests cover retry with a rotated token and cleanup on refresh failure. Backend controller tests cover invalid refresh/logout contracts, subject mismatch, JWT session claims, and endpoint attributes. |
| AuthGuard, RoleGuard, permission, and RBAC | Guard and permission unit tests remain in the merge gate. Backend policy tests lock the reviewed anonymous-action allow-list and require authorization on the realtime hub. Host integration tests prove anonymous requests receive `401`, including a sensitive Factor delete route. |
| Runtime configuration | `AppConfigService` tests cover required fields, absolute URLs, URL joining, embedded credentials, production protocol downgrade, and private on-premise exceptions. `npm run verify` now executes `config:audit:primary` across the currently releasable runtime inputs. The full `config:audit` continues to reject the deferred `qoqnooscoffee` public downgrade until deployment supplies TLS. |
| HTTP interceptors | Security tests cover same-API token attachment, external URL isolation, unauthorized cleanup, refresh/retry, refresh failure, and forbidden responses. Exception tests cover network, validation, authorization, not-found, conflict, rate-limit, Blob, and server-error messages. |
| Financial and sensitive SQL endpoints | Existing controller suites retain parameterization and injection regression coverage for Factor, PreFactor, reports, payroll, GoodsGrp, DbSetup, customer, lookup, attachment, and mobile endpoints. The backend host integration suite additionally proves a Factor delete route is authorization-protected before controller/database execution. |
| Workforce list/grid | The reference Workforce Absence Type component is tested with a typed API fixture for load success, controlled failure, columns, and the legacy edit route. |
| Health and smoke | In-memory host integration covers public liveness, unavailable readiness without database configuration, protected routes, and invalid auth input. `scripts/smoke-test.ps1` repeats the main checks against a real temporary process on `60007`. |

After the Phase 4 additions, Angular has `84` tests. Backend has `163` tests, and diagnostic coverage is `41.67%` lines and `23.69%` branches. The increase is secondary to the closed high-risk paths; uncovered legacy UI remains future incremental work when those features change.

## Typed API fixtures

Reusable frontend response fixtures live in `src/testing/fixtures/api-response.fixtures.ts`. They model:

- a successful authenticated login response;
- an OTP challenge response;
- a central permission response;
- a Workforce Absence Type list response.

Fixture values are synthetic and contain no production password, key, token, or connection string.

## Merge quality gates

The repositories have independent GitHub Actions workflows because they are separate Git repositories:

- Angular `.github/workflows/quality-gate.yml` runs locked dependency installation, security audit, releasable runtime-profile audit, script syntax checks, TypeScript checks, all unit/component tests, the development build, and the primary `itmaliIp` build.
- Backend `.github/workflows/quality-gate.yml` runs audited restore, Release build, all unit/integration tests, vulnerability inventory, and the isolated process smoke test.

The workflows run on pull requests and on pushes to each repository's primary branch. They use Windows runners to match the `net10.0-windows` backend target and local Chrome/Karma behavior.

## Smoke test contract

Run after a Release build:

```powershell
dotnet build webapikits.sln -c Release
.\scripts\smoke-test.ps1 -Configuration Release
```

The script refuses port `60006`, refuses to replace an existing listener on its temporary port, uses process-local synthetic configuration, and always stops only the process it created. Default assertions are:

- `/health/live` -> `200`
- `/api/Auth/v2/session` without a token -> `401`
- incomplete `/api/Auth/KowsarLogin` -> `400`
- `/health/ready` -> `503` when no real database dependency is configured

For an authorized deployment environment with a valid deployment-owned `KITS_CONFIG_PATH`, run with `-UseRuntimeConfiguration -ExpectedReadyStatus 200`. The real `qoqnooscoffee` URL and database-backed readiness remain deployment gates and are not replaced by committed placeholders.

## Regression policy

- Every P0/P1 bug must add a test at the lowest stable boundary that reproduces it.
- Route names, response envelopes, field casing, named connection strings, and legacy database behavior stay compatible unless a breaking change is explicitly approved.
- SQL contract work requires authoritative schema/procedure evidence and read-only discovery before implementation.
- The merge gate must not require or print production secrets.
