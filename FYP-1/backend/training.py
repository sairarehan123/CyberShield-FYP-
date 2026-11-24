"""
CyberShield - AI training generator (Groq)

Reads the user's unified profile (profiling.py -> training_brief) and asks an
AI model (Groq) to write a SHORT personalised training plan for ONE area at a time:
    3 to 5 short steps, each with the reason.

ONE AREA AT A TIME
- When a specific theory (pmt / tpb / ttat) is selected, the plan targets that
  theory's OWN weakest constructs first (lowest score in that theory's questionnaire).
- Otherwise, it falls back to the user's weakest SeBIS area.
- When the user finishes it (complete_current_area), the NEXT weakest area is
  unlocked.
- Progress is saved in results_training/<user_id>_progress.json.
"""

import functools
import json
import os
import re
import urllib.error
import urllib.request
import threading
from datetime import datetime

import theory_linking
from profiling import build_user_profile

RESULTS_DIR = "results_training"
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
DEFAULT_MODEL = "openai/gpt-oss-120b"
MIN_STEPS, MAX_STEPS = 3, 5
FAILS_BEFORE_NEW_PLAN = 2  # after this many failed checks the AI writes a new plan


def _pretty(area):
    return area.replace('_', ' ')


# One lock for all progress files: the web requests AND the background timer both change them.
PROGRESS_LOCK = threading.RLock()


def locked(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        with PROGRESS_LOCK:
            return fn(*args, **kwargs)
    return wrapper


class TrainingUnavailable(Exception):
    """The AI could not make a plan and there is no saved plan to show."""


# ---------------------------------------------------------------------
# .env reader (tiny, so no extra package is needed)
# ---------------------------------------------------------------------
def load_env(path=".env"):
    if os.path.isfile(path):
        with open(path, encoding="utf-8-sig") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))
    # Provider settings: LLM_* (any OpenAI-style provider, e.g. Groq or xAI Grok) win over GROQ_*.
    if os.environ.get("LLM_API_KEY", "").strip():
        os.environ["GROQ_API_KEY"] = os.environ["LLM_API_KEY"].strip()
    if os.environ.get("LLM_MODEL", "").strip():
        os.environ["GROQ_MODEL"] = os.environ["LLM_MODEL"].strip()


def _chat_url():
    base = os.environ.get("LLM_BASE_URL", "").strip().rstrip("/")
    return (base + "/chat/completions") if base else GROQ_URL


def llm_complete(messages, json_mode=False, temperature=0.4):
    """One call to the AI provider with a full message list. Returns the answer text.
    Raises TrainingUnavailable (never anything else) if the AI cannot answer."""
    load_env()
    key = os.environ.get("GROQ_API_KEY", "").strip()
    model = os.environ.get("GROQ_MODEL", DEFAULT_MODEL).strip() or DEFAULT_MODEL
    if not key:
        raise TrainingUnavailable("The AI is not set up (no API key in backend/.env).")

    def call(use_json):
        body = {"model": model, "temperature": temperature, "messages": messages}
        if use_json:
            body["response_format"] = {"type": "json_object"}
        req = urllib.request.Request(
            _chat_url(), data=json.dumps(body).encode("utf-8"),
            headers={"Content-Type": "application/json", "Authorization": f"Bearer {key}",
                     "User-Agent": "CyberShield/1.0"}, method="POST")
        with urllib.request.urlopen(req, timeout=45) as resp:
            return json.loads(resp.read().decode("utf-8"))["choices"][0]["message"]["content"]

    try:
        try:
            return call(json_mode)
        except urllib.error.HTTPError as e:
            if e.code == 400 and json_mode:
                return call(False)
            raise
    except Exception as e:
        raise TrainingUnavailable(f"The AI could not answer right now ({e}).")


# ---------------------------------------------------------------------
# Building the request (scores and levels ONLY, ONE area)
# ---------------------------------------------------------------------
SYSTEM_PROMPT = (
    "You are a friendly cybersecurity coach for everyday smartphone and computer users. "
    "You write short, practical training plans in simple English. "
    "Always answer with JSON only."
)


THEORY_LABELS = {
    "pmt": "Protection Motivation Theory",
    "tpb": "Theory of Planned Behavior",
    "ttat": "Technology Threat Avoidance Theory",
}

THEORY_MEANINGS = {
    "pmt": theory_linking.LOW_SCORE_MEANING,
    "tpb": theory_linking.TPB_LOW_SCORE_MEANING,
    "ttat": theory_linking.TTAT_LOW_SCORE_MEANING,
}


def focus_brief(profile, theory):
    """Builds the training queue ordered by the weakest constructs of the chosen theory
    (so PMT, TPB, and TTAT each train their own actual weak area rather than repeating the same SeBIS area)."""
    if theory and theory in profile.get("theories", {}):
        t_data = profile["theories"][theory]
        c_scores = t_data.get("construct_scores", {})
        c_levels = t_data.get("construct_levels", {})
        meanings = THEORY_MEANINGS.get(theory, {})

        # Sort this theory's constructs from lowest score (weakest) to highest
        ranked = sorted(c_scores.items(), key=lambda kv: kv[1])
        weak = [(c, s) for c, s in ranked if c_levels.get(c) != "High"]
        if not weak and ranked:
            weak = [ranked[0]]  # even if all High, train the lowest-scoring construct of this theory

        out = []
        for construct, score in weak:
            level = c_levels.get(construct, "Low")
            meaning = meanings.get(construct, "")
            # Also attach the weakest SeBIS habit so the AI connects the theory factor to real-world habits
            sebis_weak = profile.get("sebis", {}).get("weakest_area")
            reasons = [{
                "theory": theory,
                "construct": construct,
                "score": score,
                "level": level,
                "meaning": meaning,
            }]
            if sebis_weak:
                sebis_lvl = profile.get("sebis", {}).get("subscale_levels", {}).get(sebis_weak, "Low")
                reasons.append({
                    "theory": "sebis",
                    "construct": sebis_weak,
                    "score": profile.get("sebis", {}).get("subscale_scores", {}).get(sebis_weak, 0),
                    "level": sebis_lvl,
                    "meaning": f"Everyday habit area needing improvement: {_pretty(sebis_weak)}",
                })
            out.append({
                "area": construct,
                "sebis_score": score,
                "sebis_level": level,
                "scale_max": 7,
                "reasons": reasons,
                "reason_known": True,
            })
        return out

    return profile["training_brief"]


def build_prompt(item, retry=False, background=None, theory=None):
    """item: ONE entry of focus_brief. Contains no names or ids."""
    scale_max = item.get("scale_max", 5)
    area = {
        "area": item["area"],
        "current_level": item["sebis_level"],
        f"score_out_of_{scale_max}": item["sebis_score"],
        "likely_reasons": [
            {"factor": r["construct"], "theory": r["theory"],
             "level": r["level"], "meaning": r["meaning"]}
            for r in item["reasons"]
        ] or "none found - probably a habit problem, so build small daily habits",
    }
    retry_text = (
        "The person already tried an earlier plan for this area and did not pass the check, "
        "so write a DIFFERENT and EASIER plan: simpler words, smaller steps, new examples.\n"
    ) if retry else ""
    bg_text = {
        "technical": "The person has a technical background (IT / computing): steps can use some technical terms.\n",
        "non_technical": "The person has NO technical background: use very simple everyday words, no jargon.\n",
    }.get(background, "")
    theory_text = (
        f"The person chose to build their training around {THEORY_LABELS[theory]}. "
        f"Their weakest construct in {THEORY_LABELS[theory]} is '{_pretty(item['area'])}' "
        f"(level: {item['sebis_level']}). Base the steps and their reasons directly on improving "
        f"this specific {THEORY_LABELS[theory]} construct.\n"
    ) if theory in THEORY_LABELS else ""
    return (
        "Write a training plan for a person who is weak in the security area below. "
        "This is the area they are working on now.\n" + retry_text + bg_text + theory_text +
        "Give 3 to 5 short steps (each at most 20 words) the person can do today on their own. "
        "Tie the steps to the likely reasons: for example if confidence is low, start with very easy "
        "steps; if the person does not feel at risk, show why it matters; if the effort feels too "
        "high, make the steps small.\n"
        "Every step needs a short 'reason' (at most 20 words) saying why it helps this person.\n"
        "Use EXACTLY the area name given. Return ONLY this JSON shape:\n"
        '{"area":"<area name>","steps":[{"step":"...","reason":"..."}]}\n\n'
        "Weak area:\n" + json.dumps(area, indent=2)
    )


# ---------------------------------------------------------------------
# Calling Groq
# ---------------------------------------------------------------------
def _call_groq(prompt, api_key, model, use_json_mode=True):
    body = {
        "model": model,
        "temperature": 0.4,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
    }
    if use_json_mode:
        body["response_format"] = {"type": "json_object"}
    req = urllib.request.Request(
        _chat_url(),
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json",
                 "Authorization": f"Bearer {api_key}",
                 "User-Agent": "CyberShield/1.0"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=40) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    return data["choices"][0]["message"]["content"]


def _extract_json(text):
    """Parses the AI answer even if it wrapped the JSON in extra text."""
    try:
        return json.loads(text)
    except ValueError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            raise ValueError("no JSON found in the AI answer")
        return json.loads(match.group(0))


def validate_steps(raw, area):
    """Checks the AI answer for ONE area. Returns clean steps, or raises ValueError."""
    if raw.get("area") not in (None, area):
        raise ValueError("AI answered for a different area")
    steps = []
    for s in raw.get("steps", []):
        step, reason = str(s.get("step", "")).strip(), str(s.get("reason", "")).strip()
        if step and reason:
            steps.append({"step": step, "reason": reason})
    steps = steps[:MAX_STEPS]
    if len(steps) < MIN_STEPS:
        raise ValueError(f"AI gave fewer than {MIN_STEPS} usable steps")
    return steps


# ---------------------------------------------------------------------
# Progress (which areas are done, and the saved plan for each)
# ---------------------------------------------------------------------
def _progress_path(user_id):
    safe = re.sub(r"[^A-Za-z0-9_.-]", "_", user_id)
    return os.path.join(RESULTS_DIR, f"{safe}_progress.json")


def load_progress(user_id):
    path = _progress_path(user_id)
    if os.path.isfile(path):
        with open(path, encoding="utf-8") as f:
            progress = json.load(f)
        if "chat" not in progress:  # saved by an older version of the training: keep it aside, start clean
            os.replace(path, path + ".old")
            progress = {"user_id": user_id, "completed": [], "current_area": None, "plans": {}}
    else:
        progress = {"user_id": user_id, "completed": [], "current_area": None, "plans": {}}
    progress.setdefault("checks", {})    # per area: fails, attempts, current check
    progress.setdefault("history", [])   # one summary per finished area
    progress.setdefault("chat", {})      # per area: the chatbot conversation
    return progress


def add_chat(progress, area, role, text, kind="text", data=None):
    """Adds one message to the chatbot conversation of an area (keeps the last 80)."""
    entry = {"role": role, "kind": kind, "text": text, "at": datetime.now().strftime("%Y-%m-%d_%H-%M-%S")}
    if data is not None:
        entry["data"] = data
    log = progress["chat"].setdefault(area, [])
    log.append(entry)
    del log[:-80]
    return entry


def save_progress(progress):
    os.makedirs(RESULTS_DIR, exist_ok=True)
    with open(_progress_path(progress["user_id"]), "w", encoding="utf-8") as f:
        json.dump(progress, f, indent=2)


def reset_progress(user_id):
    """Testing helper: start the user's training again from the weakest area."""
    path = _progress_path(user_id)
    if os.path.isfile(path):
        os.remove(path)


def _next_item(brief, completed):
    """First (= weakest) area in the brief that the user has not finished."""
    for rank, item in enumerate(brief, start=1):
        if item["area"] not in completed:
            return rank, item
    return None, None


def _response(user_id, plan, brief, completed, theories, message_extra=None):
    """What the app receives: the CURRENT area only, plus the name of the next one."""
    left = [b for b in brief if b["area"] != plan["area"] and b["area"] not in completed]
    nxt = left[0]["area"] if left else None
    if nxt:
        message = (f"Do these steps in real life, then take a short quiz. "
                   f"After that, we will move on to your next area: {_pretty(nxt)}.")
    else:
        message = ("This is your last area. Do these steps in real life, then take a short quiz "
                   "to finish your training.")
    out = {
        "user_id": user_id, "status": "ok", "theories_used": theories,
        "area": plan["area"], "priority": plan["priority"],
        "is_weakest": plan["priority"] == 1,
        "sebis_score": plan["sebis_score"], "sebis_level": plan["sebis_level"],
        "steps": plan["steps"], "source": plan.get("source", "ai"),
        "model": plan.get("model"), "next_area": nxt,
        "areas_remaining_after_this": len(left), "check_required": True, "message": message,
    }
    if message_extra:
        out["note"] = message_extra
    return out


# ---------------------------------------------------------------------
# Main entry points
# ---------------------------------------------------------------------
@locked
def generate_training(user_id, refresh=False, profile=None):
    """
    Training for the user's CURRENT area (the weakest one not finished yet for the active theory).
    Raises LookupError if the user has no SeBIS result yet,
    TrainingUnavailable if the AI failed and there is no saved plan for this area.
    """
    load_env()
    if profile is None:
        profile = build_user_profile(user_id)
    if profile is None:
        raise LookupError("No SeBIS assessment found for this user. Complete SeBIS first.")

    progress = load_progress(user_id)
    focus = progress.get("focus_theory")
    brief = focus_brief(profile, focus)
    theories = profile["theories_completed"]
    if not brief:
        return {"user_id": user_id, "status": "no_training_needed", "theories_used": theories,
                "message": "All your security areas are strong. Keep it up!"}

    rank, item = _next_item(brief, progress["completed"])
    if item is None:
        return {"user_id": user_id, "status": "all_done", "theories_used": theories,
                "message": "You have finished the training for all your weak areas. Great work!"}
    area = item["area"]

    saved = progress["plans"].get(area)
    # Also regenerate if the saved plan was created under a different theory
    if saved is not None and saved.get("theory") != focus:
        saved = None

    area_checks = progress["checks"].get(area, {})
    retry = area_checks.get("fails", 0) >= FAILS_BEFORE_NEW_PLAN
    if retry:
        refresh = True  # failed the check too many times: write a new, easier plan
    if saved is not None and not refresh:
        progress["current_area"] = area
        save_progress(progress)
        return _response(user_id, {**saved, "source": "saved"}, brief, progress["completed"], theories)

    api_key = os.environ.get("GROQ_API_KEY", "").strip()
    model = os.environ.get("GROQ_MODEL", DEFAULT_MODEL).strip() or DEFAULT_MODEL
    prompt = build_prompt(item, retry=retry, background=progress.get("background"), theory=focus)

    last_error = None
    if api_key:
        for attempt in range(2):  # one retry if the answer is unusable
            try:
                try:
                    text = _call_groq(prompt, api_key, model, use_json_mode=True)
                except urllib.error.HTTPError as e:
                    if e.code == 400:  # model may not support JSON mode: ask without it
                        text = _call_groq(prompt, api_key, model, use_json_mode=False)
                    else:
                        raise
                steps = validate_steps(_extract_json(text), area)
                plan = {"area": area, "theory": focus, "priority": rank, "sebis_score": item["sebis_score"],
                        "sebis_level": item["sebis_level"], "steps": steps,
                        "source": "ai", "model": model,
                        "generated_at": datetime.now().strftime("%Y-%m-%d_%H-%M-%S")}
                progress["plans"][area] = plan
                progress["current_area"] = area
                if retry or refresh:  # a new plan starts a fresh round of checks
                    area_checks["fails"] = 0
                    area_checks["current"] = None
                    area_checks["quiz_passed"] = False
                    area_checks["eval_fails"] = 0
                    area_checks["evaluation"] = None
                    progress["checks"][area] = area_checks
                save_progress(progress)
                return _response(user_id, plan, brief, progress["completed"], theories)
            except Exception as e:  # network, key, bad JSON... never crash the app
                last_error = e
    else:
        last_error = "GROQ_API_KEY is not set in backend/.env"

    if saved is not None:  # refresh failed: keep the plan the user already has
        return _response(user_id, {**saved, "source": "saved"}, brief, progress["completed"], theories,
                         "The AI could not make a new plan just now, so this is your saved plan.")
    raise TrainingUnavailable(f"Could not create the training plan right now. Please try again. ({last_error})")


def get_current_plan(user_id):
    """The saved plan for the area the user is working on now, or None."""
    progress = load_progress(user_id)
    area = progress.get("current_area")
    if area and area not in progress["completed"]:
        return progress["plans"].get(area)
    return None


def mark_area_completed(progress, area):
    """Called by training_check.py when the user passes the quiz and simulation."""
    if area not in progress["completed"]:
        progress["completed"].append(area)
    progress["current_area"] = None


def print_plan(plan):
    if plan.get("status") in ("no_training_needed", "all_done"):
        print("\n" + plan["message"])
        return
    tag = "  <-- your WEAKEST area, start here" if plan["is_weakest"] else ""
    print(f"\n=== Your training: {_pretty(plan['area']).upper()} ===")
    print(f"(Score {plan['sebis_score']} - {plan['sebis_level']}){tag}\n")
    for i, s in enumerate(plan["steps"], 1):
        print(f"  {i}. {s['step']}\n     why: {s['reason']}")
    print("\n" + plan["message"])


def _terminal_flow(name):
    import training_check
    import training_drill

    while True:
        # 1. the phishing evaluation may be waiting (or arriving later) from a quiz already passed
        state = training_drill.get_drill(name)
        if state["state"] == "consent_required":
            print("\n" + state["message"])
            if input("Do you agree? (yes/no): ").strip().lower() not in ("y", "yes"):
                print("OK. Your training cannot continue without this. Run this again if you change your mind.")
                return
            training_drill.set_consent(name, True)
            continue
        if state["state"] in ("scheduled", "preparing", "in_progress"):
            res = training_check.run_drill_in_terminal(name)
            if res["state"] != "resolved" or (res["passed"] and res["all_done"]):
                return
            input("\nPress Enter to continue...")
            continue
        # 2. otherwise: the training plan for the current (weakest unfinished) area, then the quiz
        plan = generate_training(name)
        print_plan(plan)
        if plan.get("status") != "ok":
            return
        answer = input("\nDo the steps. When you are ready, press Enter to start the quiz (or type Q to stop): ")
        if answer.strip().lower() == "q":
            print("OK. Your plan is saved - run this again whenever you are ready.")
            return
        training_check.run_quiz_in_terminal(name)
        input("\nPress Enter to continue...")


if __name__ == "__main__":
    name = ""
    while not name:
        name = input("Enter the SAME name or ID you used for SeBIS: ").strip()
    if input("Type RESET to start training again from the weakest area (or press Enter): ").strip().lower() == "reset":
        reset_progress(name)
        print("Training progress cleared.")
    try:
        _terminal_flow(name)
    except LookupError as e:
        print("\n" + str(e))
    except (TrainingUnavailable, ValueError) as e:
        print("\n" + str(e))