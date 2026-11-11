# CyberShield - FYP

AI-powered mobile app for cybersecurity behavior assessment and personalized guidance.
Supervisor: Naurin Farooq Khan

## What is built
| Part | What it does |
|---|---|
| **SeBIS** (16 items, 1-5) | HOW the person behaves: device securement, password generation, proactive awareness, updating |
| **PMT** (30 items, 1-7) | WHY - protection motivation (severity, vulnerability, response efficacy, self-efficacy, response cost, intention) |
| **TPB** (14 items, 1-7) | WHY - attitude, subjective norm, perceived behavioral control |
| **TTAT** (35 items, 1-7) | WHY - susceptibility, severity, threat, response effectiveness, self-efficacy, response cost |
| **Unified profile** (`profiling.py`) | Combines SeBIS + every completed theory: weak areas, likely reasons, and a `training_brief` for the AI training step |

The SeBIS-to-theory mappings (`theory_linking.py`) are a **DRAFT**, not yet approved by the supervisor.
Not built yet: AI-generated training, Supabase connection, login, admin dashboard.

## Folder layout
```
backend/     Python logic + API (run everything from inside this folder)
  sebis_scoring.py / sebis_assessment.py   SeBIS scoring + terminal questionnaire + saved results
  pmt_scoring.py   / pmt_assessment.py     PMT
  tpb_scoring.py   / tpb_assessment.py     TPB
  ttat_scoring.py  / ttat_assessment.py    TTAT
  theory_linking.py   SeBIS area -> theory construct mappings (DRAFT) + plain-English meanings
  profiling.py        one profile from SeBIS + all theories; add a theory = one entry in THEORIES
  main.py             FastAPI wrapper used by the mobile app
  generate_fake_users.py, generate_fake_pmt_users.py (+ the two .csv files)   fake users for testing
frontend/    React Native (Expo) app (run everything from inside this folder)
  src/screens/ components/ navigation/ services/ theme/ utils/
docs/
  API_GUIDE.md        every endpoint, scales, real response examples - START HERE for the app
```
Each theory has the same two files (`*_scoring.py` = maths, `*_assessment.py` = questionnaire + saving).
Saved results go to `backend/results*/` and are git-ignored.

## Run in the terminal (no app needed)
```
cd backend
python sebis_assessment.py     # do this first (asks for a name)
python pmt_assessment.py       # same name
python tpb_assessment.py       # same name
python ttat_assessment.py      # same name -> ends with the unified profile
```

## Run the API
```
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
Docs in the browser: http://localhost:8000/docs - full guide: `docs/API_GUIDE.md`.
The main endpoint for the result screens is `GET /assessment/user-profile/{user_id}`.
The same `user_id` must be used for every questionnaire - that is what links them.

## Run the app
```
cd frontend
npm install
npx expo install @react-native-async-storage/async-storage
```
Create `frontend/.env` (git-ignored): `EXPO_PUBLIC_API_URL=http://<your-computer's-IPv4>:8000`
(Android emulator: `http://10.0.2.2:8000`). Start the backend first, then `npx expo start -c` in `frontend`.
Phone and computer on the same WiFi. Use the Expo Go version that matches the project's Expo SDK.

## Branches
`main` is untouched. Work is on `sebis-pmt-logic`.
