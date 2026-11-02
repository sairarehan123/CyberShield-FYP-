# PMT screens — guide for the mobile developer

Everything the app needs already exists in the backend. **The frontend never calculates a score** — it sends raw answers and shows what the backend returns.

## 1. Run it
```
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
- Open http://localhost:8000/docs to try every endpoint in the browser.
- In the project root create a `.env` file (it is git-ignored): `EXPO_PUBLIC_API_URL=http://<your-computer's-IPv4>:8000`
  (Android emulator: `http://10.0.2.2:8000`). Restart with `npx expo start -c`.

## 2. The flow
1. The user answers **SeBIS** (16 questions, 1–5) — screens already exist in `src/screens/SeBIS*.js`.
2. Then **PMT** (30 statements, **1–7**) — *these are the screens to build.*
3. Then show the **combined result** (SeBIS behavior + PMT motivation).

**Use the same `userId` for SeBIS and PMT** — that is what links them. Use `getOrCreateGuestUserId()` from `src/services/guestUser.js` (a placeholder until real login exists).
There is **no retake** and no comparison between attempts.

## 3. Ready-made calls (`src/services/sebisApi.js`)
| Function | Does |
|---|---|
| `fetchPmtQuestions()` | the 30 statements + the 7-point answer scale |
| `submitPmt(userId, answers)` | sends `{PS1: 6, PV1: 4, ...}` (all 30, each 1–7), returns the PMT profile |
| `fetchCombinedProfile(userId)` | latest SeBIS + latest PMT + `theory_links` (the connection) |

## 4. Fastest way to build the PMT screens
Copy the 4 SeBIS screens and change only these things:
- `fetchQuestions` → `fetchPmtQuestions`, `submitAssessment` → `submitPmt`
- screen names (`PMTIntro`, `PMTQuestionnaire`, `PMTReview`, `PMTReport`) and register them in `src/navigation/AppNavigator.js`
- intro text ("16 quick questions · about 3 minutes" → "30 statements")
- the report: show `profile.construct_scores` / `construct_levels`, and `theory_links.focus.message` from `fetchCombinedProfile`

`QuestionCard` renders whatever `answer_scale` the API returns, so the 7 PMT options work without changes (check the layout — 7 options is taller than 5).

## 5. Real response examples

`GET /assessment/pmt/questions` (shortened)
```json
{
  "total_questions": 30,
  "answer_scale": [
    { "value": 1, "label": "Strongly disagree" },
    { "value": 2, "label": "Disagree" },
    { "value": 3, "label": "Somewhat disagree" },
    { "value": 4, "label": "Neutral" },
    { "value": 5, "label": "Somewhat agree" },
    { "value": 6, "label": "Agree" },
    { "value": 7, "label": "Strongly agree" }
  ],
  "questions": [
    { "id": "PS1", "order": 1, "text": "A security breach on my device would be a serious problem for me." }
  ]
}
```

`POST /assessment/pmt/score` — body `{ "user_id": "demo", "answers": { "PS1": 6, ... all 30 ... } }`
```json
{
  "assessment_id": "demo_2026-10-31_13-18-33",
  "user_id": "demo",
  "timestamp": "2026-10-31_13-18-33",
  "profile": {
    "construct_scores": {
      "perceived_severity": 6.0, "perceived_vulnerability": 6.0, "response_cost": 1.0,
      "response_efficacy": 6.0, "self_efficacy": 6.0, "security_intention": 6.0
    },
    "construct_levels": {
      "perceived_severity": "High", "perceived_vulnerability": "High", "response_cost": "Low",
      "response_efficacy": "High", "self_efficacy": "High", "security_intention": "High"
    },
    "threat_appraisal_score": 6.0,
    "coping_appraisal_score": 4.33,
    "overall_score": 5.0,
    "overall_level": "High",
    "weakest_area": "response_cost"
  }
}
```
Errors come back as HTTP 400 with `{"detail": "..."}` (missing answer, unknown id, value outside 1–7). `sebisApi.js` already turns these into readable `Error` messages.

`GET /assessment/profile/{user_id}` (shortened)
```json
{
  "user_id": "demo",
  "sebis_completed": true,
  "pmt_completed": true,
  "sebis": { "...saved SeBIS record..." },
  "pmt": { "...saved PMT record..." },
  "theory_links": {
    "framework": "PMT",
    "mapping_status": "draft_pending_supervisor_approval",
    "pmt_completed": true,
    "security_intention": { "score": 6.0, "level": "High" },
    "focus": {
      "weakest_sebis_area": "password_generation",
      "likely_barrier": "response_cost",
      "message": "Your weakest security area is password generation. The most likely barrier is that you find security measures too costly, slow or inconvenient."
    },
    "areas": {
      "password_generation": {
        "sebis_score": 1.0, "sebis_level": "Low",
        "related_constructs": [
          { "construct": "response_cost", "why": "Unique, strong passwords take effort to create and remember.", "score": 1.0, "level": "Low" }
        ],
        "likely_barrier": "response_cost"
      }
    }
  }
}
```
- `404` if the user has neither result. `theory_links` is `null` until SeBIS is done; before PMT is done it holds a message asking the user to complete PMT.
- `likely_barrier` is `null` for an area where the SeBIS level is already High.

## 6. Good to know
- **Response cost is reverse-scored** (as in the source paper), so for *every* construct a **higher score is better**. For response cost that means "low effort/cost". Label it so users don't misread a low score.
- Suggested display names: `perceived_severity` → "Threat severity", `perceived_vulnerability` → "Threat vulnerability", `response_efficacy` → "Response efficacy", `self_efficacy` → "Self-efficacy", `response_cost` → "Response cost", `security_intention` → "Security intention".
- The SeBIS→PMT mapping in `backend/theory_linking.py` is a **draft, pending supervisor approval** — don't present it as final.
- PMT items are from Kiran et al. (2025), *Computers & Security* 149, Appendix 1 (originally Thompson et al., 2017).
