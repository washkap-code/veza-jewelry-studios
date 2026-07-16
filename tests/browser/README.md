# Browser tests

Playwright-driven end-to-end checks. The dev server must be running at
`http://localhost:8080` before you run them.

## Sidebar visibility per role

Verifies that:

- an admin sees every sidebar link (Dashboard, Products, Collections,
  Gemstones, Gallery, Orders, Journal, Commissions, Newsletter, Calendar,
  Settings), and
- a staff account sees ONLY Dashboard, Gallery, Orders, Journal — and
  none of the admin-only links.

Run it with real credentials (they never leave your machine):

```bash
ADMIN_EMAIL='you@example.com' ADMIN_PASS='...' \
STAFF_EMAIL='staff@example.com' STAFF_PASS='...' \
python tests/browser/sidebar_roles.py
```

Screenshots for each role are written to
`tests/browser/screenshots/{admin,staff}_sidebar.png`.

Exit code is `0` on success, `1` on any failure, and `0` (with a "SKIP"
message) when the credentials env vars are missing.

## /admin access control

Verifies that:

- an admin (`is_admin=true`) can reach `/admin` and sees the admin sidebar,
- a signed-in non-admin client is blocked (redirected off `/admin` or shown
  the "Restricted" panel — no admin sidebar), and
- an unauthenticated visitor cannot reach `/admin`.

```bash
ADMIN_EMAIL='you@example.com' ADMIN_PASS='...' \
CLIENT_EMAIL='client@example.com' CLIENT_PASS='...' \
python tests/browser/admin_access.py
```

Screenshots are written to `tests/browser/screenshots/admin_access_*.png`.
