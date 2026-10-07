# JWT and authentication sessions

## Token claims

Access tokens contain the existing identity claims plus:

- `role`: one claim per server-resolved role;
- `permission`: one claim per server-resolved permission;
- `sid`: the stable identifier of one browser login session;
- `token_version`: the current subject-wide revocation version;
- `iat` and `nbf`: issue/not-before timestamps.

Roles and permissions are loaded by the backend from the authoritative
`spWeb_CentralPermission_Get` contract. The browser does not supply trusted
authorization claims.

## Session behavior

- Refresh-token rotation preserves the same `sid`.
- Revoking one `sid` signs out only that browser session.
- Revoking all sessions increments `token_version` and signs out every browser
  for the subject.
- With `Jwt:ValidateSessionOnEveryRequest=true`, revoked access tokens are
  rejected immediately instead of remaining usable until `exp`.
- The number of concurrent active sessions is controlled by
  `Jwt:MaxActiveSessionsPerUser`.

## API routes

| Route | Access | Purpose |
| --- | --- | --- |
| `GET /api/Auth/v2/session` | Authenticated | Current token identity and claims |
| `GET /api/Auth/v2/sessions/mine` | Authenticated | Current subject's sessions |
| `DELETE /api/Auth/v2/sessions/mine/{sid}` | Authenticated | Revoke one owned session |
| `GET /api/Auth/v2/sessions` | `ADMIN` | List recent/active sessions |
| `DELETE /api/Auth/v2/sessions/{sid}` | `ADMIN` | Revoke any session |
| `POST /api/Auth/v2/sessions/revoke-all` | `ADMIN` | Revoke every session for a subject |

The Angular administration page is `/rbac/sessions` and is protected by the
existing `ADMIN` route guard.

## Guest ticket authentication

Guest ticket access is isolated from customer and employee authentication:

| Route | Access | Purpose |
| --- | --- | --- |
| `POST /api/Auth/v2/guest/otp/request` | Anonymous, rate limited | Send/create a mobile OTP challenge |
| `POST /api/Auth/v2/guest/otp/verify` | Anonymous, rate limited | Consume the challenge and issue a `GUEST` session |
| `POST /api/AutLetter/GuestTicketCreate` | `GUEST` only | Create a ticket with server-controlled ownership |

The OTP response never contains the verification code. Challenges are valid
for five minutes, are single-use, store only a hash of the code, and lock after
five failed attempts. A guest token carries the `GUEST` role and
`AUTLETTER_GUEST_CREATE` permission, but middleware rejects that token from
every endpoint that has not explicitly opted into guest access.

Angular exposes `/auth/guest-login` and the guarded `/guest/ticket` form. The
ticket request contains only `title` and `description`; the backend reads the
verified mobile from JWT claims and resolves all assignment references from
server configuration.

## Deployment prerequisite

Before starting the new backend, apply
`webapikits/Database/Migrations/20260916_AuthSessionManagement.sql` to the exact
database selected by `KowsarIdentityDb`. Verify the resolved target and take a
backup according to the backend migration runbook. The application never runs
this DDL automatically.
