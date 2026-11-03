# CyberShield — FYP

AI-powered mobile app for cybersecurity behavior assessment and personalized guidance.
Supervisor: Naurin Farooq Khan

## Current Status
- **SeBIS** (16 items): records how a person usually behaves around their devices. Scoring engine with correct reverse-scoring. There is no retake and no attempt comparison.
- **PMT** (30 items, 7-point scale, Kiran et al. 2025): records *why* — the person's motivation to protect their devices (threat severity, threat vulnerability, response efficacy, self-efficacy, response cost, security intention).
- **SeBIS ↔ PMT link** (`backend/theory_linking.py`): for each SeBIS area, shows the PMT constructs that may explain it and names the most likely barrier. **The mapping is a DRAFT, not yet approved by the supervisor.**
- FastAPI backend and React Native (Expo) screens for SeBIS (new design, connected to the backend). PMT screens are being built by a teammate.

## Folder layout
```
backend/    Python logic + API (run everything from inside this folder)
  sebis_scoring.py      SeBIS scoring engine
  sebis_assessment.py   SeBIS questionnaire (terminal) + save/load results
  pmt_scoring.py        PMT scoring engine
  pmt_assessment.py     PMT questionnaire (terminal) + shows the SeBIS↔PMT link
  theory_linking.py     SeBIS area → PMT construct mapping (DRAFT)
  main.py               FastAPI wrapper used by the mobile app
  generate_fake_users.py  generates 500 fake users to test SeBIS scoring
frontend/   React Native (Expo) app (run everything from inside this folder)
  App.js, index.js, app.json, package.json
  src/screens/      Splash, Onboarding, Login, SignUp, Home + SeBIS (Assess, AssessmentQuestions, AssessmentResult)
  src/components/   shared UI components
  src/services/     sebisApi.js (talks to the backend), guestUser.js
  src/theme/        colours, spacing, typography
docs/       guides (e.g. PMT UI guide for the teammate)
```
Saved results go to `backend/results/` (SeBIS) and `backend/results_pmt/` (PMT); both are git-ignored.

## Run in the terminal (no app needed)
```
cd backend
python sebis_assessment.py     # welcome -> name -> 16 questions (1-5) -> profile
python pmt_assessment.py       # same name -> 30 statements (1-7) -> profile + SeBIS↔PMT link
```

## Run the API
```
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
Docs: http://localhost:8000/docs

| Endpoint | Purpose |
|---|---|
| `GET  /assessment/sebis/questions` | the 16 SeBIS questions |
| `POST /assessment/sebis/score` | `{user_id, answers}` → profile |
| `GET  /assessment/pmt/questions` | the 30 PMT questions |
| `POST /assessment/pmt/score` | `{user_id, answers}` → profile |
| `GET  /assessment/profile/{user_id}` | latest SeBIS + latest PMT + `theory_links` |

The same `user_id` must be used for SeBIS and PMT — that is what links them.

## Run the app
```
cd frontend
npm install
npx expo install @react-native-async-storage/async-storage
```
Create a file called `.env` inside the `frontend` folder (git-ignored) with your backend address:
```
EXPO_PUBLIC_API_URL=http://<your-computer's-IPv4>:8000
```
(Android emulator: `http://10.0.2.2:8000`.) Start the backend first, then in `frontend` run `npx expo start -c`.
Phone and computer must be on the same WiFi. Use the Expo Go version that matches the project's Expo SDK.
