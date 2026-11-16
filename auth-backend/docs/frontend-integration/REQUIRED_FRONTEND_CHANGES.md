# Frontend changes needed (NOTHING has been changed yet -- permission requested)

Your screens currently contain `// TODO: call real ... API here.` and jump straight to Home, so **no API is called today**.
The backend is built around the fields those screens already have. To connect them, these small changes are needed.
None of them touch layout, colours, styling, navigation structure or components.

| # | File | Change | Why |
|---|------|--------|-----|
| 1 | `src/services/api.js` (NEW file) | Add the helper in `docs/frontend-integration/api.js` | The app has no API service file yet. |
| 2 | `src/screens/SignUpScreen.js` | In `handleSignUp`, replace the TODO with `api.register(form)`. Pass `loading` to the existing `CustomButton`. Put `err.fields` into the existing `errors` state. | Without it, "Create Account" never reaches the backend. |
| 3 | `src/screens/LoginScreen.js` | In `handleLogin`, replace the TODO with `api.login({ email, password })`. Show failures via the existing `errors` state. | Same reason. |
| 4 | `src/screens/HomeScreen.js` | In the Log Out `onPress`, call `api.logout(accessToken)` before `navigation.reset(...)`. | So the session is revoked on the server. |
| 5 | Session holder (NEW, small) | Keep `accessToken` / `refreshToken` after login. For "Remember Me" persistence across app restarts, install `expo-secure-store` (new dependency). | Home needs the token for logout/profile; Remember Me needs storage. |

Notes
- If Supabase "Confirm email" is ON, register returns `requiresEmailConfirmation: true` and no session. The current flow (go straight to Home) then needs a "check your email" message. Easiest for development: turn "Confirm email" OFF.
- There is no Profile screen yet, so `GET/PATCH /api/profile` can only be tested with curl/Postman for now.
- "Forgot Password?" and the Google/Apple buttons are placeholders; they are outside this module.
