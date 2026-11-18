"""
CyberShield - SeBIS API

Wraps the SeBIS, PMT, TPB and TTAT logic as a REST API for the React Native app.
There is no retake / attempt comparison: each submission is saved, and
the latest SeBIS + latest PMT result are what get linked together. Does NOT duplicate the scoring
formulas - it only calls the functions already built and tested.

Run with:
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
"""

import threading
import time
from typing import Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from sebis_scoring import SEBIS_ITEMS, build_profile
from sebis_assessment import (
    get_latest_result,
    save_result,
    get_result_by_id,
)

# PMT (Protection Motivation Theory) - imported as modules so its function
# names (build_profile, save_result, ...) never clash with the SeBIS ones.
import pmt_scoring
import pmt_assessment
import tpb_scoring
import tpb_assessment
import ttat_scoring
import ttat_assessment
from profiling import build_user_profile
import training
import training_check
import training_drill
import training_chat
from theory_linking import link_sebis_to_pmt
from auth_routes import router as auth_router

app = FastAPI(title="CyberShield SeBIS API")

# Allows the Expo app (running on a different host/port) to call this API.
# Tighten this list once you know your real app's origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

VALID_ITEM_IDS = {item["id"] for item in SEBIS_ITEMS}
ANSWER_SCALE = [
    {"value": 1, "label": "Never"},
    {"value": 2, "label": "Rarely"},
    {"value": 3, "label": "Sometimes"},
    {"value": 4, "label": "Often"},
    {"value": 5, "label": "Always"},
]


# ---------------------------------------------------------------------
# Request/response models
# ---------------------------------------------------------------------
class SubmitAssessmentRequest(BaseModel):
    user_id: str
    answers: Dict[str, int]  # e.g. {"F1": 4, "F2": 5, ...} - all 16 required


class SubmitCheckRequest(BaseModel):
    quiz_answers: Dict[str, str]  # e.g. {"q1": "b", "q2": "a", ... "q5": "d"}


class ConsentRequest(BaseModel):
    accepted: bool = True


class ContactRequest(BaseModel):
    email: Optional[str] = None
    push_token: Optional[str] = None


class ChatRequest(BaseModel):
    message: str


class TheoryRequest(BaseModel):
    theory: str


class BackgroundRequest(BaseModel):
    background: str


# ---------------------------------------------------------------------
# GET /assessment/sebis/questions
# ---------------------------------------------------------------------
@app.get("/assessment/sebis/questions")
def get_questions():
    questions = [
        {"id": item["id"], "order": i, "text": item["text"]}
        for i, item in enumerate(SEBIS_ITEMS, start=1)
    ]
    return {
        "total_questions": len(questions),
        "answer_scale": ANSWER_SCALE,
        "questions": questions,
    }


# ---------------------------------------------------------------------
# POST /assessment/sebis/score
# ---------------------------------------------------------------------
@app.post("/assessment/sebis/score")
def submit_assessment(payload: SubmitAssessmentRequest):
    answers = payload.answers
    user_id = payload.user_id.strip()

    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required.")

    # --- Validate completeness: all 16 items present ---
    missing = VALID_ITEM_IDS - set(answers.keys())
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing answers for: {sorted(missing)}",
        )

    # --- Validate no unknown item ids were sent ---
    unknown = set(answers.keys()) - VALID_ITEM_IDS
    if unknown:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown question id(s): {sorted(unknown)}",
        )

    # --- Validate every value is an int from 1 to 5 ---
    for item_id, value in answers.items():
        if not isinstance(value, int) or value < 1 or value > 5:
            raise HTTPException(
                status_code=400,
                detail=f"Answer for {item_id} must be an integer from 1 to 5.",
            )

    # --- The backend calculates the score itself - never trusts the frontend ---
    profile = build_profile(answers)

    saved_record = save_result(user_id, answers, profile)

    return {
        "assessment_id": saved_record["assessment_id"],
        "user_id": user_id,
        "timestamp": saved_record["timestamp"],
        "profile": profile,
    }


# ---------------------------------------------------------------------
# GET /assessment/sebis/results/{assessment_id}
# ---------------------------------------------------------------------
@app.get("/assessment/sebis/results/{assessment_id}")
def get_result(assessment_id: str):
    record = get_result_by_id(assessment_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Assessment not found.")
    return record


# =====================================================================
# PMT (Protection Motivation Theory) assessment - 30 items, 7-point scale
# Same flow as SeBIS, saved separately in results_pmt/.
# =====================================================================
PMT_VALID_ITEM_IDS = {item["id"] for item in pmt_scoring.PMT_ITEMS}
PMT_ANSWER_SCALE = [
    {"value": v, "label": label} for v, label in pmt_assessment.SCALE_LABELS.items()
]


# ---------------------------------------------------------------------
# GET /assessment/pmt/questions
# ---------------------------------------------------------------------
@app.get("/assessment/pmt/questions")
def get_pmt_questions():
    questions = [
        {"id": item["id"], "order": i, "text": item["text"]}
        for i, item in enumerate(pmt_scoring.PMT_ITEMS, start=1)
    ]
    return {
        "total_questions": len(questions),
        "answer_scale": PMT_ANSWER_SCALE,
        "questions": questions,
    }


# ---------------------------------------------------------------------
# POST /assessment/pmt/score
# ---------------------------------------------------------------------
@app.post("/assessment/pmt/score")
def submit_pmt_assessment(payload: SubmitAssessmentRequest):
    answers = payload.answers
    user_id = payload.user_id.strip()

    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required.")

    missing = PMT_VALID_ITEM_IDS - set(answers.keys())
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing answers for: {sorted(missing)}",
        )

    unknown = set(answers.keys()) - PMT_VALID_ITEM_IDS
    if unknown:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown question id(s): {sorted(unknown)}",
        )

    for item_id, value in answers.items():
        if not isinstance(value, int) or value < 1 or value > 7:
            raise HTTPException(
                status_code=400,
                detail=f"Answer for {item_id} must be an integer from 1 to 7.",
            )

    # The backend calculates the score itself - never trusts the frontend.
    profile = pmt_scoring.build_profile(answers)

    saved_record = pmt_assessment.save_result(user_id, answers, profile)

    return {
        "assessment_id": saved_record["assessment_id"],
        "user_id": user_id,
        "timestamp": saved_record["timestamp"],
        "profile": profile,
    }


# ---------------------------------------------------------------------
# GET /assessment/pmt/results/{assessment_id}
# ---------------------------------------------------------------------
@app.get("/assessment/pmt/results/{assessment_id}")
def get_pmt_result(assessment_id: str):
    record = pmt_assessment.get_result_by_id(assessment_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Assessment not found.")
    return record


# =====================================================================
# Combined profile: latest SeBIS (behavior) + latest PMT (motivation),
# linked through theory_linking.py. Read-only - it never recalculates or
# changes any saved result.
# =====================================================================
@app.get("/assessment/profile/{user_id}")
def get_combined_profile(user_id: str):
    user_id = user_id.strip()
    sebis_record = get_latest_result(user_id)                 # latest saved SeBIS
    pmt_record = pmt_assessment.get_latest_result(user_id)    # latest saved PMT

    if sebis_record is None and pmt_record is None:
        raise HTTPException(
            status_code=404,
            detail="No SeBIS or PMT assessment found for this user.",
        )

    theory_links = None
    if sebis_record is not None:
        pmt_profile = pmt_record["profile"] if pmt_record else None
        theory_links = link_sebis_to_pmt(sebis_record["profile"], pmt_profile)

    return {
        "user_id": user_id,
        "sebis_completed": sebis_record is not None,
        "pmt_completed": pmt_record is not None,
        "sebis": sebis_record,
        "pmt": pmt_record,
        # null until SeBIS is done (the mapping starts from the SeBIS result)
        "theory_links": theory_links,
    }


# =====================================================================
# TPB (Theory of Planned Behavior) assessment - 14 items, 7-point scale
# Same flow as PMT, saved separately in results_tpb/.
# =====================================================================
TPB_VALID_ITEM_IDS = {item["id"] for item in tpb_scoring.TPB_ITEMS}
TPB_ANSWER_SCALE = [
    {"value": v, "label": label} for v, label in tpb_assessment.SCALE_LABELS.items()
]


@app.get("/assessment/tpb/questions")
def get_tpb_questions():
    questions = [
        {"id": item["id"], "order": i, "text": item["text"]}
        for i, item in enumerate(tpb_scoring.TPB_ITEMS, start=1)
    ]
    return {
        "total_questions": len(questions),
        "answer_scale": TPB_ANSWER_SCALE,
        "questions": questions,
    }


@app.post("/assessment/tpb/score")
def submit_tpb_assessment(payload: SubmitAssessmentRequest):
    answers = payload.answers
    user_id = payload.user_id.strip()

    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required.")

    missing = TPB_VALID_ITEM_IDS - set(answers.keys())
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing answers for: {sorted(missing)}")

    unknown = set(answers.keys()) - TPB_VALID_ITEM_IDS
    if unknown:
        raise HTTPException(status_code=400, detail=f"Unknown question id(s): {sorted(unknown)}")

    for item_id, value in answers.items():
        if not isinstance(value, int) or value < 1 or value > 7:
            raise HTTPException(
                status_code=400,
                detail=f"Answer for {item_id} must be an integer from 1 to 7.",
            )

    # The backend calculates the score itself - never trusts the frontend.
    profile = tpb_scoring.build_profile(answers)
    saved_record = tpb_assessment.save_result(user_id, answers, profile)

    return {
        "assessment_id": saved_record["assessment_id"],
        "user_id": user_id,
        "timestamp": saved_record["timestamp"],
        "profile": profile,
    }


@app.get("/assessment/tpb/results/{assessment_id}")
def get_tpb_result(assessment_id: str):
    record = tpb_assessment.get_result_by_id(assessment_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Assessment not found.")
    return record


# =====================================================================
# TTAT (Technology Threat Avoidance Theory) assessment - 35 items, 7-point scale
# Same flow as PMT and TPB, saved separately in results_ttat/.
# =====================================================================
TTAT_VALID_ITEM_IDS = {item["id"] for item in ttat_scoring.TTAT_ITEMS}
TTAT_ANSWER_SCALE = [
    {"value": v, "label": label} for v, label in ttat_assessment.SCALE_LABELS.items()
]


@app.get("/assessment/ttat/questions")
def get_ttat_questions():
    questions = [
        {"id": item["id"], "order": i, "text": item["text"]}
        for i, item in enumerate(ttat_scoring.TTAT_ITEMS, start=1)
    ]
    return {
        "total_questions": len(questions),
        "answer_scale": TTAT_ANSWER_SCALE,
        "questions": questions,
    }


@app.post("/assessment/ttat/score")
def submit_ttat_assessment(payload: SubmitAssessmentRequest):
    answers = payload.answers
    user_id = payload.user_id.strip()

    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required.")

    missing = TTAT_VALID_ITEM_IDS - set(answers.keys())
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing answers for: {sorted(missing)}")

    unknown = set(answers.keys()) - TTAT_VALID_ITEM_IDS
    if unknown:
        raise HTTPException(status_code=400, detail=f"Unknown question id(s): {sorted(unknown)}")

    for item_id, value in answers.items():
        if not isinstance(value, int) or value < 1 or value > 7:
            raise HTTPException(
                status_code=400,
                detail=f"Answer for {item_id} must be an integer from 1 to 7.",
            )

    # The backend calculates the score itself - never trusts the frontend.
    profile = ttat_scoring.build_profile(answers)
    saved_record = ttat_assessment.save_result(user_id, answers, profile)

    return {
        "assessment_id": saved_record["assessment_id"],
        "user_id": user_id,
        "timestamp": saved_record["timestamp"],
        "profile": profile,
    }


@app.get("/assessment/ttat/results/{assessment_id}")
def get_ttat_result(assessment_id: str):
    record = ttat_assessment.get_result_by_id(assessment_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Assessment not found.")
    return record


# =====================================================================
# Unified user profile: latest SeBIS + the latest result of EVERY theory
# completed (PMT, TPB and TTAT), with the weak areas, their likely
# reasons, and the "training_brief" the AI training step reads.
# Read-only; theories not yet completed are simply listed as missing.
# (/assessment/profile/{user_id} above is unchanged.)
# =====================================================================
@app.get("/assessment/user-profile/{user_id}")
def get_user_profile(user_id: str):
    profile = build_user_profile(user_id.strip())
    if profile is None:
        raise HTTPException(
            status_code=404,
            detail="No SeBIS assessment found for this user. Complete SeBIS first.",
        )
    return profile


# =====================================================================
# AI training (Groq) - ONE area at a time, weakest first.
#   generate : training for the user's current area (the weakest not finished yet)
#   complete : the user finished it -> the next weakest area unlocks
#   current  : the saved plan for the area in progress
# The key lives in backend/.env - see training.py.
# =====================================================================
@app.post("/training/{user_id}/generate")
def generate_training_plan(user_id: str, refresh: bool = False):
    try:
        return training.generate_training(user_id.strip(), refresh=refresh)
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except training.TrainingUnavailable as e:
        raise HTTPException(status_code=503, detail=str(e))


@app.post("/training/{user_id}/check/start")
def start_training_check(user_id: str):
    """The QUIZ for the area the user is working on (no correct answers inside)."""
    try:
        return training_check.start_check(user_id.strip())
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except training.TrainingUnavailable as e:
        raise HTTPException(status_code=503, detail=str(e))


@app.post("/training/{user_id}/check/submit")
def submit_training_check(user_id: str, payload: SubmitCheckRequest):
    """Grades the quiz on the server. Passing it schedules the phishing drill."""
    try:
        return training_check.submit_check(user_id.strip(), payload.quiz_answers)
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ---------------- Progress check = simulated phishing messages over several days ----------------
@app.get("/training/{user_id}/drill")
def get_training_drill(user_id: str):
    """State: none | consent_required | preparing | scheduled | in_progress | resolved. Holds the INBOX."""
    return training_drill.get_drill(user_id.strip())


class NotificationsReadRequest(BaseModel):
    ids: Optional[List[str]] = None     # leave out to mark everything as read


@app.get("/training/{user_id}/notifications")
def get_training_notifications(user_id: str):
    """List for the app's notification screen: {unread, notifications[{id,kind,title,body,at,read,target}]}."""
    try:
        return training_drill.get_notifications(user_id.strip())
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/training/{user_id}/notifications/read")
def read_training_notifications(user_id: str, payload: NotificationsReadRequest):
    return training_drill.mark_notifications_read(user_id.strip(), payload.ids)


@app.post("/training/{user_id}/drill/{message_id}/click")
def click_training_message(user_id: str, message_id: str):
    """The user tapped the link in a simulated message -> fell victim. Returns the debrief."""
    try:
        return training_drill.click_message(user_id.strip(), message_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/training/{user_id}/drill/{message_id}/report")
def report_training_message(user_id: str, message_id: str):
    """The user pressed 'Report phishing' on a message. Returns the debrief."""
    try:
        return training_drill.report_message(user_id.strip(), message_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/sim/click/{token}", response_class=HTMLResponse, include_in_schema=False)
def phishing_drill_link(token: str):
    """The tracking link inside a simulated email / message (opens in any browser)."""
    try:
        result = training_drill.click_by_token(token)
    except ValueError:
        result = None
    return HTMLResponse(training_drill.render_click_page(result))


@app.post("/training/{user_id}/consent")
def give_training_consent(user_id: str, payload: ConsentRequest):
    """One-time agreement to receive simulated security messages."""
    try:
        return training_chat.give_consent(user_id.strip(), payload.accepted)
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/training/{user_id}/contact")
def set_training_contact(user_id: str, payload: ContactRequest):
    """Where simulated messages are sent when the app is closed: e-mail and / or Expo push token."""
    try:
        return training_drill.set_contact(user_id.strip(), payload.email, payload.push_token)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ---------------- The training CHATBOT (this is what the training screen uses) ----------------
@app.get("/training/{user_id}/chat")
def get_training_chat(user_id: str):
    """The whole chat, the current stage, the steps / quiz / inbox, and the actions allowed now."""
    try:
        return training_chat.get_chat(user_id.strip())
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except training.TrainingUnavailable as e:
        raise HTTPException(status_code=503, detail=str(e))


@app.post("/training/{user_id}/chat")
def send_training_chat_message(user_id: str, payload: ChatRequest):
    """The user asks the coach something. Off-topic questions are politely redirected."""
    try:
        return training_chat.send_message(user_id.strip(), payload.message)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except training.TrainingUnavailable as e:
        raise HTTPException(status_code=503, detail=str(e))


@app.post("/training/{user_id}/chat/quiz")
def start_training_chat_quiz(user_id: str):
    """The coach starts the 5-question quiz."""
    try:
        return training_chat.begin_quiz(user_id.strip())
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except training.TrainingUnavailable as e:
        raise HTTPException(status_code=503, detail=str(e))


@app.post("/training/{user_id}/chat/quiz/submit")
def submit_training_chat_quiz(user_id: str, payload: SubmitCheckRequest):
    """Grades the quiz; the coach explains the mistakes."""
    try:
        return training_chat.answer_quiz(user_id.strip(), payload.quiz_answers)
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/training/{user_id}/theory")
def set_training_theory(user_id: str, payload: TheoryRequest):
    """The user chooses the theory (pmt | tpb | ttat) the training is based on. Returns the chat state."""
    try:
        return training_chat.set_theory(user_id.strip(), payload.theory)
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except training.TrainingUnavailable as e:
        raise HTTPException(status_code=503, detail=str(e))


@app.post("/training/{user_id}/background")
def set_training_background(user_id: str, payload: BackgroundRequest):
    """technical | non_technical (asked once, e.g. at signup)."""
    try:
        return training_chat.set_background(user_id.strip(), payload.background)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ---------------- Timer: sends the due messages even when nobody has the app open ----------------
def _drill_timer():
    while True:
        time.sleep(60)
        try:
            training_drill.process_all()
        except Exception as e:  # the timer must never die
            print(f"[drill timer] {e}")


@app.on_event("startup")
def start_drill_timer():
    training.load_env()
    threading.Thread(target=_drill_timer, daemon=True).start()


@app.get("/training/{user_id}/current")
def get_current_training_plan(user_id: str):
    plan = training.get_current_plan(user_id.strip())
    if plan is None:
        raise HTTPException(status_code=404, detail="No training in progress. Start your training first.")
    return plan


@app.get("/")
def health_check():
    return {"status": "ok", "service": "CyberShield SeBIS API"}