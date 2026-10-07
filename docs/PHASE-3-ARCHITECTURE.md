# Phase 3 architecture baseline

This document is the copyable baseline for new Kowsar Angular and ASP.NET Core work. Legacy public API routes and response field casing remain compatible unless a breaking change is explicitly approved.

## Angular domain boundary

New feature code uses this structure:

```text
features/<domain>/
  components/<use-case>/<name>.component.{ts,html,css}
  models/<use-case>.models.ts
  services/<use-case>-api.service.ts
  <domain>.routes.ts
```

- File and route segments use `kebab-case`.
- Classes use `PascalCase`; injected services end in `Service`.
- API request/response names use `Request`, `Query`, `Record`, and `Response` suffixes.
- Existing backend field casing such as `WorkforceAbsenceTypes` is preserved at the HTTP boundary.
- New HTTP methods must return a concrete response model. `unknown` is used at a genuine legacy boundary; `any` requires a written reason and must not leak into new domain code.

The workforce absence Type slice is the reference implementation:

- `models/workforce-absence-type.models.ts`
- `services/workforce-absence-type-api.service.ts`
- `components/workforce-absence/type-list`
- `components/workforce-absence/type-edit`

`AuthSessionService` is the reference use-case facade: login components own UI/navigation while the facade owns token, normalized session, permission, and role persistence.

## List/Edit/Grid CRUD pattern

For a new CRUD page:

1. Define the backend envelope and row/request types in the domain `models` folder.
2. Put HTTP calls and legacy route names in a focused `*-api.service.ts`.
3. Use `CrudListState<T>` in the List/Grid component for `idle/loading/loaded/error`, records, selection, upsert, and remove behavior.
4. Keep forms and navigation in the component; do not put DOM manipulation or session persistence in the API service.
5. On load, call `beginLoad()`, then `resolve(rows)` or `reject(message)`.
6. Test the state lifecycle and the HTTP URL/method/envelope separately.

This is intentionally a small state primitive rather than a mandatory base component, so existing `AgGridBaseComponent` behavior and legacy grids remain compatible.

## Backend boundary

New or migrated endpoints use this flow:

```text
Controller -> use-case/domain service -> repository/DataAccess -> IDbService -> named connection string
```

- Controllers own HTTP validation, headers, status codes, logging, and legacy response formatting.
- `DataAccess` owns SQL text, parameters, query selection, and fallback rules.
- SQL values are parameterized. Dynamic identifiers require an allow-list or identifier quoting.
- Repository methods use the existing named connection selected through `IDbService`; no `BaseDb` dependency is allowed.
- `BaseReadRepository` is the reference extraction for lookup, server date, and user-aware grid schema reads. Existing `api/Base/*` routes and response envelopes are unchanged.

## Runtime and package baseline

- Backend target: `.NET 10` LTS (`net10.0-windows`).
- SQL Server provider: `Microsoft.Data.SqlClient`.
- SQLite legacy provider: `System.Data.SQLite.Core` only; the unused meta/EF package is excluded.
- Connection values remain runtime-owned through `appsettings.Runtime.json`, `KITS_CONFIG_PATH`, environment-specific JSON, or environment variables.
- After the SqlClient migration, each environment must make its TLS decision explicit. Prefer `Encrypt=True;TrustServerCertificate=False` with a valid server certificate. A private legacy environment may use another setting only as a documented deployment decision.

## Legacy asset and copy policy

- jQuery is no longer included in the Angular bundle. Angular-native code uses DOM/Angular APIs and obsolete global `$` declarations were removed.
- The physical jQuery asset remains quarantined under `src/assets/libs/jquery` for non-bundled legacy consumers; deleting it requires deployment-level usage proof.
- `src/app/features/santral` is the routed Santral implementation.
- The untracked `src/app/features/internal/components/santral` tree is not bundled, but it contains divergent files. It is retained to avoid deleting user work until its owner explicitly archives or reconciles it.
- Dead login/session duplication removed in Phase 3 was behaviorally covered by Auth/session tests. Copy directories are deleted only when route/import scans and build/runtime checks prove they are unused.

## Required verification

For an affected Angular slice, run `npm run typecheck`, unit tests, `npm run security:audit`, and the applicable runtime-profile build. For backend changes, run Release build, all tests, NuGet vulnerability audit, and a temporary smoke instance on port `60007`; never stop the existing process on `60006`.
