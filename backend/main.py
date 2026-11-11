"""
CyberShield - SeBIS API

Wraps the SeBIS, PMT, TPB and TTAT logic as a REST API for the React Native app.
There is no retake / attempt comparison: each submission is saved, and
the latest SeBIS + latest PMT result are what get linked together. Does NOT duplicate the scoring
formulas - it only calls the functions already built and tested.

Run with:
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
"""

from typing import Dict

from fastapi import FastAPI, HTTPException
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
from theory_linking import link_sebis_to_pmt

app = FastAPI(title="CyberShield SeBIS API")

# Allows the Expo app (running on a different host/port) to call this API.
# Tighten this list once you know your real app's origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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


@app.get("/")
def health_check():
    return {"status": "ok", "service": "CyberShield SeBIS API"}
