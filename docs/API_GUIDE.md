# CyberShield API guide (for the app developer)

The backend does ALL the scoring. The app only sends raw answers and shows what comes back.
Never calculate a score in the app.

## 1. Run the backend
```
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
- Try every endpoint in the browser: http://localhost:8000/docs
- App address: create `frontend/.env` (git-ignored) with `EXPO_PUBLIC_API_URL=http://<your-IPv4>:8000`, then `npx expo start -c`.

## 2. The flow
SeBIS first, then the four theories in any order, then the profile screen.
**Use the SAME `userId` everywhere** - that is what links the results. (`getOrCreateGuestUserId()` in `src/services/guestUser.js` until real login exists.) No retake.

| Step | Questions | Scale | Answer ids |
|---|---|---|---|
| SeBIS | 16 | 1-5 | F1 ... F16 |
| PMT | 30 | 1-7 | PS1 ... SI3 |
| TPB | 14 | 1-7 | ATT1-4, SN1-5, PBC1-5 |
| TTAT | 35 | 1-7 | SUS1-6, SEV1-5, THR1-7, EFF1-5, SE1-5, COST1-7 |

The 1-7 labels come from the API (`answer_scale`): Strongly disagree ... Strongly agree. Reverse-worded items are flipped by the backend - the app shows and sends the raw answer.

## 3. Endpoints and ready-made functions (`src/services/sebisApi.js`)
| Endpoint | Function | Does |
|---|---|---|
| `GET /assessment/{sebis,pmt,tpb,ttat}/questions` | `fetchQuestions`, `fetchPmtQuestions`, `fetchTpbQuestions`, `fetchTtatQuestions` | questions + `answer_scale` |
| `POST /assessment/{sebis,pmt,tpb,ttat}/score` | `submitAssessment`, `submitPmt`, `submitTpb`, `submitTtat` | body `{user_id, answers}` -> that theory's profile |
| `GET /assessment/{sebis,pmt,tpb,ttat}/results/{assessment_id}` | `fetchResultById` (SeBIS) | one saved result |
| **`GET /assessment/user-profile/{user_id}`** | **`fetchUserProfile`** | **the combined profile - build the result screens from this** |
| `GET /assessment/profile/{user_id}` | `fetchCombinedProfile` | older SeBIS + PMT only view (kept for the existing PMT screens) |

Errors come back as `{"detail": "..."}` (400 = bad/missing/out-of-range answers, 404 = not found / no SeBIS yet).

## 4. Score response (same shape for PMT, TPB, TTAT)
`POST /assessment/ttat/score`
```json
{
  "assessment_id": "demo_2026-11-11_05-03-24",
  "user_id": "demo",
  "timestamp": "2026-11-11_05-03-24",
  "profile": {
    "construct_scores": { "perceived_susceptibility": 5.0, "perceived_severity": 4.6, "perceived_threat": 5.0,
                          "response_effectiveness": 5.0, "self_efficacy": 2.0, "response_cost": 3.0 },
    "construct_levels": { "perceived_susceptibility": "High", "perceived_severity": "Medium", "perceived_threat": "High",
                          "response_effectiveness": "High", "self_efficacy": "Low", "response_cost": "Low" },
    "overall_score": 4.1,
    "overall_level": "Medium",
    "weakest_area": "self_efficacy"
  }
}
```
- Levels are always `"Low" | "Medium" | "High"`. **High always means better** (reverse items are already flipped; for `response_cost`, High = security feels cheap and easy).
- PMT also returns `threat_appraisal_score` and `coping_appraisal_score`.
- Constructs: PMT - perceived_severity, perceived_vulnerability, response_cost, response_efficacy, self_efficacy, security_intention. TPB - attitude, subjective_norm, perceived_behavioral_control. TTAT - perceived_susceptibility, perceived_severity, perceived_threat, response_effectiveness, self_efficacy, response_cost.

## 5. The profile screen: `GET /assessment/user-profile/{user_id}`
```json
{
  "user_id": "demo",
  "mapping_status": "draft_pending_supervisor_approval",
  "theories_completed": ["pmt", "tpb", "ttat"],
  "theories_missing": [],
  "sebis": {
    "overall_score": 2.89, "overall_level": "Medium",
    "subscale_scores": { "device_securement": 3.5, "password_generation": 3.0, "proactive_awareness": 2.4, "updating": 2.67 },
    "subscale_levels": { "device_securement": "High", "password_generation": "Medium", "proactive_awareness": "Low", "updating": "Medium" },
    "weakest_area": "proactive_awareness"
  },
  "theories": {
    "ttat": { "overall_score": 4.1, "overall_level": "Medium", "construct_scores": { "...": 0 }, "construct_levels": { "...": "Low" }, "weakest_area": "self_efficacy" }
  },
  "areas": {
    "proactive_awareness": {
      "sebis_score": 2.4, "sebis_level": "Low", "needs_training": true,
      "likely_barrier": { "theory": "pmt", "construct": "perceived_vulnerability", "score": 3.0, "level": "Low", "...": "..." },
      "reasons": [ { "theory": "pmt", "construct": "perceived_vulnerability", "score": 3.0, "level": "Low",
                     "meaning_if_low": "you do not feel personally at risk of an attack", "why": "..." } ],
      "drivers": [ "every related construct, lowest first" ]
    }
  },
  "training_brief": [
    { "area": "proactive_awareness", "sebis_score": 2.4, "sebis_level": "Low", "reason_known": true,
      "reasons": [ { "theory": "pmt", "construct": "perceived_vulnerability", "score": 3.0, "level": "Low",
                     "meaning": "you do not feel personally at risk of an attack" } ] }
  ]
}
```
How to read it:
- **"How secure am I?"** -> `sebis.overall_*` and the four `sebis.subscale_*`.
- **"Why do I behave this way?"** -> `areas[area].reasons[].meaning_if_low` (plain-English sentence, show it as is) and `.theory` (pmt / tpb / ttat) for a small label.
- **"What needs work?"** -> `areas` where `needs_training` is true. A strong area has `needs_training: false` and no reasons.
- `reason_known: false` means the area is weak but no motivation factor is low - more likely habit. Show a neutral message, not an error.
- `theories_missing` lists theories the user has not done yet - use it for "Complete TPB to see more" buttons. Missing theories never cause an error.
- Do not display `mapping_status` as final - the SeBIS-to-theory mapping is a draft until the supervisor approves it.
- `training_brief` is for the AI training step (backend); the app does not need it yet.

## 6. Fastest way to build the TPB / TTAT screens
Copy the PMT screens and change only: the fetch function, the submit function, the screen names (register them in `src/navigation/AppNavigator.js`), the intro text (14 / 35 statements) and the construct labels in the report. The question card shows whatever `answer_scale` the API returns. 35 questions: show them in pages (about 5 per page) or one at a time with the progress bar.
