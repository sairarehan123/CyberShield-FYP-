# CyberShield Backend (Registration & Profile module)

Node.js + Express REST API using **Supabase Auth** (accounts/passwords) and **Supabase PostgreSQL** (profiles).
Scope: registration, login, logout, profile. SeBIS, PMT/TTAT/TPB, AI guidance and the admin dashboard are **not** included yet.

## What is verified and what is not

| Item | Status |
|------|--------|
| All source files, `schema.sql`, docs | **Generated** |
| JavaScript syntax (`node --check`) | **Passed** |
| 14 smoke tests (`npm test`): health, validation, 401 without token, bad JSON, 404, CORS | **Passed** (these run with dummy credentials and never contact Supabase) |
| Register / login / refresh / logout / profile against a **real Supabase project** | **NOT tested yet.** You must run the steps below to confirm. |
| Frontend connected to the backend | **NOT done.** The frontend still has TODOs and calls no API (see `docs/frontend-integration/`). |

Things I could not verify and you should watch for: (1) `schema.sql` creating a trigger on `auth.users`; (2) logout via the admin API when your project uses the newer *secret* key format; (3) whether a revoked session is rejected immediately afterwards.

## Folder structure
```
CyberShield_Backend/
  src/  config/ controllers/ routes/ middleware/ services/ utils/  app.js  server.js
  supabase/schema.sql
  test/smoke.test.js
  docs/frontend-integration/   (api.js helper + required frontend changes)
  .env.example  .gitignore  package.json  README.md
```
Design choices: the **service-role key is used only for logout**. Profile reads/writes use the caller's own token, so Row Level Security does the access control. The profile row is created by a **database trigger**, so the backend never needs elevated rights to write it.

## Setup (beginner friendly)

1. **Install Node.js** (v18 or newer, LTS) from nodejs.org. Check: `node -v` and `npm -v`.
2. **Extract** the ZIP and open the `CyberShield_Backend` folder in VS Code (or a terminal opened inside it).
3. **Install dependencies:** `npm install`
4. **Create a Supabase project:** supabase.com -> New project -> choose a name, a database password (save it), a region.
5. **Find the keys:** in the dashboard open *Project Settings -> API* (labels may differ slightly). You need:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon / publishable key** (public)
   - **service_role / secret key** (private: never put it in the app or on GitHub)
6. **Configure `.env`:** copy `.env.example` to `.env` and paste your three values.
7. **Create the tables:** dashboard -> *SQL Editor* -> New query -> paste all of `supabase/schema.sql` -> Run.
8. **Auth settings (development):** *Authentication* settings -> Email provider. Turn **"Confirm email" OFF** so registration returns a session right away (your current screens go straight to Home). Set the minimum password length to **8** to match the app.
9. **Start the backend:** `npm run dev` (or `npm start`). You should see `CyberShield backend running on port 4000`.
10. **Test it** (next sections).
11. **Connect the frontend** after you approve the changes in `docs/frontend-integration/REQUIRED_FRONTEND_CHANGES.md`.

## Backend URL for each environment
| Where the app runs | Base URL |
|--------------------|----------|
| Browser on your PC / Expo Web | `http://localhost:4000` (origin must be in `CORS_ORIGINS`) |
| Android emulator | `http://10.0.2.2:4000` |
| iOS simulator | `http://localhost:4000` |
| Physical phone | `http://<your-PC-LAN-IP>:4000` (same Wi-Fi; allow Node through the firewall; find the IP with `ipconfig` / `ifconfig`) |

## API
All responses: success `{ "success": true, "data": {...} }`, error `{ "success": false, "error": { "code", "message", "fields"? } }`.
`fields` keys match the frontend form state (`name`, `email`, `password`, `confirm`), so they can go straight into the existing `errors` state.
Protected routes need the header `Authorization: Bearer <accessToken>`.

| Method & path | Auth | Body | Success | Errors |
|---|---|---|---|---|
| `GET /api/health` | no | - | 200 `{status:"ok"}` | - |
| `POST /api/auth/register` | no | `{name,email,password,confirm}` | 201 `{user, session, requiresEmailConfirmation}` | 400 validation, 409 email exists, 429 |
| `POST /api/auth/login` | no | `{email,password}` | 200 `{user, session}` | 400, 401 wrong credentials, 403 email not confirmed, 429 |
| `POST /api/auth/refresh` *(extra)* | no | `{refreshToken}` | 200 `{session}` | 400, 401 |
| `POST /api/auth/logout` | yes | - | 200 `{message}` | 401 |
| `GET /api/profile` | yes | - | 200 `{profile}` | 401, 404 |
| `PATCH /api/profile` | yes | `{name}` (only `name` is editable) | 200 `{profile}` | 400, 401, 404 |

`session` = `{accessToken, refreshToken, tokenType, expiresIn, expiresAt}`. `profile` = `{id, name, email, createdAt, updatedAt}`.
`/api/auth/refresh` is an addition beyond your list; it lets "Remember Me" renew an expired access token. Remove it if you don't want it.

### Sample requests (curl; on Windows use `curl.exe`, Postman or Thunder Client)
```bash
curl http://localhost:4000/api/health

curl -X POST http://localhost:4000/api/auth/register -H "Content-Type: application/json" \
  -d '{"name":"Amna Zahood","email":"test1@example.com","password":"StrongPass123","confirm":"StrongPass123"}'

curl -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"test1@example.com","password":"StrongPass123"}'
# copy data.session.accessToken from the response, then:

curl http://localhost:4000/api/profile -H "Authorization: Bearer ACCESS_TOKEN"

curl -X PATCH http://localhost:4000/api/profile -H "Content-Type: application/json" \
  -H "Authorization: Bearer ACCESS_TOKEN" -d '{"name":"Amna Z."}'

curl -X POST http://localhost:4000/api/auth/logout -H "Authorization: Bearer ACCESS_TOKEN"
```

### Checklist to confirm it really works (tick these yourself)
- [ ] Register -> 201, and a row appears in *Table Editor -> profiles* with the right name.
- [ ] Register the same email again -> 409.
- [ ] Login with a wrong password -> 401; correct password -> 200 with tokens.
- [ ] `GET /api/profile` with the token -> your profile; without a token -> 401.
- [ ] `PATCH /api/profile` with `{"name":"New"}` -> updated, `updatedAt` changes; with `{"email":"x"}` -> 400.
- [ ] Logout -> 200; then `GET /api/profile` with the same token -> 401 (if not, tell me).
- [ ] Register a second user; user A's token never returns user B's data.

## Security summary
Secrets only in `.env` (git-ignored); Helmet; CORS allow-list; rate limits (200 requests/15 min per IP overall, 20/15 min on register/login/refresh); JSON body limit 10 KB; tokens verified by Supabase Auth on every protected call; user id taken from the verified token, never from the request; RLS enabled on `profiles` with select/update-own policies only; clients can update only `full_name` (column-level grant); no INSERT/DELETE for clients; passwords never stored or logged; the server logs only method, path and status.

## Common problems
- *"Missing or placeholder environment variables"* -> fill in `.env`.
- *Phone can't connect* -> wrong base URL, different Wi-Fi, or firewall blocking port 4000.
- *"Database error saving new user"* -> `schema.sql` was not run (or failed); re-run it.
- *Register returns `requiresEmailConfirmation: true`* -> "Confirm email" is ON in Supabase.
