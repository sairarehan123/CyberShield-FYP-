"""
CyberShield - Training check, part 1: the QUIZ (knowledge)

After the training plan, the user takes a short quiz (5 multiple-choice questions,
written by the AI about the training steps). Passing it (>= 70 %) starts part 2:
the PHISHING DRILL (training_drill.py), which tests the real SKILL - recognising
and reporting a phishing message. Only passing the drill unlocks the next area.

  * Each quiz attempt gets NEW questions. The correct answers stay on the server.
  * After FAILS_BEFORE_NEW_PLAN (2) failed attempts the AI writes a new, easier plan.
  * Every attempt is saved so improvement can be shown (first score -> latest score).

Only the area name, level and the plan's steps go to the AI - never a name or id.
"""

import json
import os
import random
import urllib.error
from datetime import datetime

import training
import training_drill
from training import (
    TrainingUnavailable, _extract_json, _pretty,
    load_env, load_progress, save_progress,
    DEFAULT_MODEL, FAILS_BEFORE_NEW_PLAN,
)
from profiling import build_user_profile

QUIZ_QUESTIONS = 5
PASS_QUIZ = 0.70
LETTERS = "abcd"

CHECK_SYSTEM_PROMPT = (
    "You are a friendly cybersecurity coach who writes fair, clear quiz questions "
    "for everyday smartphone and computer users. Always answer with JSON only."
)


# ---------------------------------------------------------------------
# Asking the AI for the quiz
# ---------------------------------------------------------------------
def build_quiz_prompt(item, plan):
    info = {
        "area": item["area"],
        "level": item["sebis_level"],
        "training_steps": [s["step"] for s in plan["steps"]],
    }
    return (
        f"A person has just been trained in the security area below. Write a short QUIZ of exactly "
        f"{QUIZ_QUESTIONS} multiple-choice questions about the training steps and about how to "
        "recognise and respond to threats in this area (for example how to spot a phishing message). "
        "Each question has 4 options, exactly one correct, in simple words. "
        "Give a one-sentence 'explanation' of why the right answer is right.\n"
        "Use 'correct_index' = the position (0 to 3) of the correct option in 'options'.\n"
        "Return ONLY this JSON shape:\n"
        '{"quiz":[{"question":"...","options":["..","..","..",".."],"correct_index":0,"explanation":".."}]}\n\n'
        "Training:\n" + json.dumps(info, indent=2)
    )


def validate_quiz(raw):
    """Validates, trims, assigns ids and SHUFFLES the options (so the right answer is not always first)."""
    out = []
    for entry in raw.get("quiz", []):
        question = str(entry.get("question", "")).strip()
        options = [str(o).strip() for o in entry.get("options", []) if str(o).strip()]
        idx = entry.get("correct_index")
        if (not question or len(options) < 3 or len(options) > 4
                or len(set(options)) != len(options)
                or not isinstance(idx, int) or not 0 <= idx < len(options)):
            continue
        correct_text = options[idx]
        random.shuffle(options)
        out.append({
            "id": f"q{len(out) + 1}",
            "question": question,
            "options": [{"id": LETTERS[i], "text": t} for i, t in enumerate(options)],
            "correct": LETTERS[options.index(correct_text)],
            "explanation": str(entry.get("explanation", "")).strip(),
        })
        if len(out) == QUIZ_QUESTIONS:
            break
    if len(out) < QUIZ_QUESTIONS:
        raise ValueError(f"AI gave only {len(out)} usable quiz questions, need {QUIZ_QUESTIONS}")
    return out


def _ask_ai_quiz(item, plan):
    load_env()
    api_key = os.environ.get("GROQ_API_KEY", "").strip()
    model = os.environ.get("GROQ_MODEL", DEFAULT_MODEL).strip() or DEFAULT_MODEL
    if not api_key:
        raise TrainingUnavailable("Could not create the quiz right now. Please try again. "
                                  "(GROQ_API_KEY is not set in backend/.env)")
    prompt = build_quiz_prompt(item, plan)
    last_error = None
    for _ in range(2):
        try:
            old = training.SYSTEM_PROMPT
            training.SYSTEM_PROMPT = CHECK_SYSTEM_PROMPT
            try:
                try:
                    text = training._call_groq(prompt, api_key, model, True)
                except urllib.error.HTTPError as e:
                    if e.code == 400:
                        text = training._call_groq(prompt, api_key, model, False)
                    else:
                        raise
            finally:
                training.SYSTEM_PROMPT = old
            return validate_quiz(_extract_json(text))
        except Exception as e:
            last_error = e
    raise TrainingUnavailable(f"Could not create the quiz right now. Please try again. ({last_error})")


# ---------------------------------------------------------------------
# Starting the quiz (the app never sees the correct answers)
# ---------------------------------------------------------------------
def _working_state(user_id):
    """(progress, area, plan) for the area the user is working on, or ValueError."""
    progress = load_progress(user_id)
    area = progress.get("current_area")
    if not area or area in progress["completed"] or area not in progress["plans"]:
        raise ValueError("There is no training in progress. Start your training first.")
    return progress, area, progress["plans"][area]


def _public(quiz, area, attempt):
    return {
        "area": area, "attempt": attempt, "pass_mark": PASS_QUIZ,
        "quiz": [{"id": q["id"], "question": q["question"], "options": q["options"]} for q in quiz],
        "message": "Pass the quiz to continue with your training.",
    }


def start_check(user_id, profile=None):
    """
    The quiz for the current area. If the user already has an unanswered quiz it is returned
    again (same questions); after an answered attempt, new questions are made.
    """
    progress, area, plan = _working_state(user_id)
    entry = progress["checks"].setdefault(area, {"fails": 0, "attempts": [], "current": None})
    if entry.get("quiz_passed"):
        raise ValueError("You already passed the quiz. Your progress check is on its way.")
    attempt = len(entry["attempts"]) + 1

    if entry.get("current") is None:
        if profile is None:
            profile = build_user_profile(user_id)
        if profile is None:
            raise LookupError("No SeBIS assessment found for this user. Complete SeBIS first.")
        item = next((b for b in profile["training_brief"] if b["area"] == area), None)
        if item is None:
            item = {"area": area, "sebis_level": plan.get("sebis_level", "Medium")}
        entry["current"] = _ask_ai_quiz(item, plan)
        save_progress(progress)
    return _public(entry["current"], area, attempt)


# ---------------------------------------------------------------------
# Grading (always on the server)
# ---------------------------------------------------------------------
def _grade_quiz(questions, answers):
    review, correct = [], 0
    for q in questions:
        given = answers.get(q["id"])
        valid = {o["id"] for o in q["options"]}
        if given not in valid:
            raise ValueError(f"Answer for {q['id']} is missing or not one of {sorted(valid)}.")
        ok = given == q["correct"]
        correct += ok
        review.append({"id": q["id"], "your_answer": given, "correct_answer": q["correct"],
                       "correct_text": next(o["text"] for o in q["options"] if o["id"] == q["correct"]),
                       "is_correct": ok, "explanation": q["explanation"]})
    total = len(questions)
    return {"correct": correct, "total": total, "score": round(correct / total, 2)}, review


def submit_check(user_id, quiz_answers, profile=None):
    """
    Grades the quiz. If passed, the phishing drill is scheduled (it arrives after the waiting time).
    The next area does NOT unlock yet - only passing the drill does.
    """
    progress, area, plan = _working_state(user_id)
    entry = progress["checks"].get(area)
    if not entry or entry.get("current") is None:
        raise ValueError("No quiz is waiting. Start the quiz first.")

    quiz, review = _grade_quiz(entry["current"], quiz_answers)
    quiz["passed"] = quiz["score"] >= PASS_QUIZ
    attempt_no = len(entry["attempts"]) + 1
    entry["attempts"].append({
        "attempt": attempt_no, "quiz_score": quiz["score"], "passed": quiz["passed"],
        "at": datetime.now().strftime("%Y-%m-%d_%H-%M-%S"),
    })
    entry["current"] = None  # the next attempt gets new questions

    improvement = None
    if attempt_no > 1:
        first = entry["attempts"][0]["quiz_score"]
        improvement = {"first_attempt": first, "this_attempt": quiz["score"],
                       "change": round(quiz["score"] - first, 2)}

    out = {"user_id": user_id, "area": area, "attempt": attempt_no, "passed": quiz["passed"],
           "quiz": quiz, "improvement": improvement, "review": {"quiz": review},
           "new_plan_next": False, "drill": None}

    if quiz["passed"]:
        entry["quiz_passed"] = True
        save_progress(progress)
        try:
            training_drill.ensure_evaluation(progress, area)
            out["drill"] = {"scheduled": True}
        except training_drill.ConsentRequired:
            out["drill"] = {"scheduled": False, "consent_required": True}
        except TrainingUnavailable:
            out["drill"] = {"scheduled": False}  # it will be created when the app next asks
        out["message"] = ("Quiz passed! Keep following your steps in daily life. "
                          "We will check how you are doing over the next days.")
    else:
        entry["fails"] = entry.get("fails", 0) + 1
        out["new_plan_next"] = entry["fails"] >= FAILS_BEFORE_NEW_PLAN
        out["message"] = (
            "You did not pass the quiz yet. Read the answers below. "
            + ("We will give you a new, easier plan for this area, then you can try again."
               if out["new_plan_next"] else "Try again with new questions."))
        save_progress(progress)
    return out


# ---------------------------------------------------------------------
# Terminal version (python training.py)
# ---------------------------------------------------------------------
def _ask_quiz_in_terminal(q):
    print(f"\n{q['question']}")
    for o in q["options"]:
        print(f"   {o['id']}) {o['text']}")
    valid = [o["id"] for o in q["options"]]
    while True:
        a = input("Your answer: ").strip().lower()
        if a in valid:
            return a
        print(f"Please type one of: {', '.join(valid)}")


def run_quiz_in_terminal(user_id):
    check = start_check(user_id)
    print(f"\n=== Attempt {check['attempt']}: QUIZ ({_pretty(check['area'])}) ===")
    answers = {q["id"]: _ask_quiz_in_terminal(q) for q in check["quiz"]}
    result = submit_check(user_id, answers)
    print(f"\nQuiz: {result['quiz']['correct']}/{result['quiz']['total']}")
    for r in result["review"]["quiz"]:
        if not r["is_correct"]:
            print(f"  - {r['id']}: right answer was {r['correct_answer']}) {r['correct_text']}\n    {r['explanation']}")
    if result["improvement"]:
        print(f"Improvement since your first attempt: {result['improvement']['change']:+.2f}")
    print("\n" + result["message"])
    return result


def run_drill_in_terminal(user_id):
    """Shows the progress-check state; lets the user act on every message that has arrived."""
    state = training_drill.get_drill(user_id)
    if state["state"] in ("scheduled", "preparing", "none"):
        print("\n" + state.get("message", "Nothing to do right now."))
        print("(For a quick test put DRILL_DELAY_MINUTES=0 and DRILL_PERIOD_MINUTES=0 in backend/.env)")
        return state
    keys = {"o": "open", "r": "report", "i": "ignore"}
    while state["state"] == "in_progress":
        waiting = [m for m in state["inbox"] if m["status"] == "open"]
        if not waiting:
            break
        m = waiting[0]
        print(f"\n===== NEW {m['channel'].upper()} =====\nFrom: {m['sender']}")
        if m["subject"]:
            print(f"Subject: {m['subject']}")
        print(f"\n{m['text']}\n\n{m['link_text']}\n")
        while True:
            a = input("What do you do?  o = open the link, r = report as phishing, i = ignore it: ").strip().lower()
            if a in keys:
                break
        if keys[a] == "open":
            out = training_drill.click_message(user_id, m["id"])
        elif keys[a] == "report":
            out = training_drill.report_message(user_id, m["id"])
        else:
            out = training_drill.force_ignore(user_id, m["id"])
        d = out["debrief"]
        if d:
            print(f"\n--- {'PHISHING' if d['was_phishing'] else 'GENUINE'} ({d['outcome'].replace('_', ' ')}) ---")
            for f in d["red_flags"]:
                print("  - " + f)
            print(d["explanation"])
        state = out["result"] if out["evaluation_finished"] else training_drill.get_drill(user_id)
    if state["state"] == "in_progress":
        print("\nMore checks will arrive in the next days. Run this again later.")
    elif state["state"] == "resolved":
        print(f"\n=== RESULT: {state['decision'].replace('_', ' ').upper()} "
              f"(proficiency {state['evaluation']['proficiency']}% - {state['evaluation']['level']}) ===")
        print(state["message"])
    return state
