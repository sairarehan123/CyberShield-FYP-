"""
CyberShield - Phishing EVALUATION PERIOD (the "simulation" part of the training check)

After the quiz, the user's real-life SKILL is evaluated over a period of days:
simulated messages (some phishing, some genuine) are SENT to them, like real ones.

  phishing message:  user CLICKS the link   -> fell victim
                     user REPORTS it        -> recognised + reported (good)
                     nothing until expiry   -> ignored (not reported)
  genuine message:   opening / ignoring is fine; REPORTING it is a false alarm

Defaults (all can be changed - see the constants and the .env settings below):
  * 4 messages: 3 phishing + 1 genuine, different tricks, AI-written, themed on the training area
  * the first one arrives DRILL_DELAY_MINUTES after the quiz (default 24 h = time to follow the steps)
  * the rest are spread over DRILL_PERIOD_MINUTES (default 7 days), at slightly random times
  * each message stays open MESSAGE_WINDOW_MINUTES (default 24 h)
  * PASS = no phishing link clicked, AND >= 2/3 of the phishing messages reported,
           AND at most 1 false report
  * pass -> the next area unlocks.  fail -> another evaluation round; after 2 failed rounds the
    AI writes a new, easier plan for the area.

Nothing here needs the app to be open: training_scheduler (a timer in main.py) calls
process_all() every minute, which sends due messages (email / push), closes expired ones and
finishes the evaluation. The state is also recalculated whenever the app asks.

CONSENT: the user must agree once (POST /training/{user_id}/consent) that CyberShield may test
them with simulated security messages. They are NOT told when or what. After EVERY message
there is a debrief that explains what gave it away.

For quick testing / the demo put these in backend/.env:
    DRILL_DELAY_MINUTES=0
    DRILL_PERIOD_MINUTES=0          (all messages arrive at once)
    MESSAGE_WINDOW_MINUTES=5

Only the area name and level go to the AI - never a name or id.
"""

import base64
import html
import json
import os
import random
import re
import secrets
import urllib.error
from datetime import datetime, timedelta, timezone

import training
import training_eval
import training_notify
from training import (
    TrainingUnavailable, _extract_json, _pretty, locked, load_env, add_chat, load_progress, save_progress,
    mark_area_completed, _next_item, DEFAULT_MODEL, FAILS_BEFORE_NEW_PLAN, RESULTS_DIR,
)
from profiling import build_user_profile

PHISHING_COUNT = 3
GENUINE_COUNT = 1
REQUIRE_NO_CLICK = True     # clicking ANY phishing link fails the evaluation
MIN_REPORT_RATE = 0.66      # must report at least this share of the phishing messages (2 of 3)
MAX_FALSE_ALARMS = 1        # reporting more genuine messages than this fails

AREA_THEMES = {
    "device_securement": "a fake security alert about their phone or laptop (lost device, locked device, "
                         "suspicious sign-in on their device)",
    "password_generation": "a fake 'your password expires today' or 'unusual login - reset your password now' message",
    "proactive_awareness": "a fake prize, parcel delivery problem, or an urgent request from a boss or unknown contact",
    "updating": "a fake 'urgent system or app update required' message",
}
GENUINE_EXAMPLES = "an order shipped, a meeting reminder, a monthly statement is ready, a newsletter"

DRILL_SYSTEM_PROMPT = (
    "You write realistic but harmless messages for a cybersecurity awareness drill. "
    "Always answer with JSON only."
)


class ConsentRequired(Exception):
    """The user has not agreed to receive simulated security messages yet."""


def _now():
    return datetime.now(timezone.utc)


def _minutes(name, default):
    try:
        return max(0, int(os.environ.get(name, default)))
    except ValueError:
        return default


def _iso(dt):
    return dt.isoformat()


def _parse(text):
    return datetime.fromisoformat(text)


# ---------------------------------------------------------------------
# Asking the AI for the messages
# ---------------------------------------------------------------------
def build_drill_prompt(area, level):
    theme = AREA_THEMES.get(area, "a believable everyday scam message")
    return (
        f"Write exactly {PHISHING_COUNT} PHISHING messages and {GENUINE_COUNT} GENUINE message(s) for a "
        "cybersecurity training drill.\n"
        f"PHISHING: theme = {theme}. Each phishing message must use a DIFFERENT trick (for example an "
        "urgent threat, a reward or prize, a fake authority, a delivery problem) and look believable "
        "(fake sender, pressure to act, a link to click). Give 2 or 3 short 'red_flags' (what gives it away).\n"
        f"GENUINE: a boring, normal routine message such as {GENUINE_EXAMPLES}, with an ordinary link. "
        "'red_flags' is an empty list.\n"
        "Rules for ALL messages: nothing harmful. Do NOT use real company or brand names - invent the sender. "
        "Every link MUST use a fake domain ending in .example "
        "(for example http://secure-check.account-verify.example/login). Never write a real URL. "
        "Choose the channel: 'SMS', 'Email' or 'App notification'; for an email also write a 'subject', "
        "otherwise leave 'subject' empty. Give a one-sentence 'explanation' (phishing: why it is a scam; "
        "genuine: why it is safe).\n"
        f"The person's current level in this area is {level} (use simple words).\n"
        "Return ONLY this JSON shape:\n"
        '{"messages":[{"is_phishing":true,"channel":"SMS","sender":"..","subject":"","message":"..",'
        '"link_text":"http://....example/..","red_flags":["..",".."],"explanation":".."}]}'
    )


def _clean_message(raw):
    message = str(raw.get("message", "")).strip()
    link = str(raw.get("link_text", "")).strip()
    phishing = raw.get("is_phishing")
    flags = [str(f).strip() for f in raw.get("red_flags", []) if str(f).strip()]
    if not message or not link or not isinstance(phishing, bool):
        return None
    if not re.search(r"\.(example|test|invalid)\b|example\.(com|org|net)", link, re.I):
        return None
    if phishing and not flags:
        return None
    channel = str(raw.get("channel", "")).strip()
    if channel not in ("SMS", "Email", "App notification"):
        channel = "SMS"
    return {
        "is_phishing": phishing, "channel": channel,
        "sender": str(raw.get("sender", "")).strip() or "Unknown sender",
        "subject": str(raw.get("subject", "")).strip() if channel == "Email" else "",
        "message": message, "link_text": link,
        "red_flags": flags[:3] if phishing else [],
        "explanation": str(raw.get("explanation", "")).strip(),
    }


def validate_messages(raw):
    cleaned = [m for m in (_clean_message(r) for r in raw.get("messages", [])) if m]
    phishing = [m for m in cleaned if m["is_phishing"]][:PHISHING_COUNT]
    genuine = [m for m in cleaned if not m["is_phishing"]][:GENUINE_COUNT]
    if len(phishing) < PHISHING_COUNT or len(genuine) < GENUINE_COUNT:
        raise ValueError(f"AI gave {len(phishing)} phishing and {len(genuine)} genuine usable messages; "
                         f"need {PHISHING_COUNT} and {GENUINE_COUNT}")
    messages = phishing + genuine
    random.shuffle(messages)
    return messages


def _ask_ai_messages(area, level):
    load_env()
    api_key = os.environ.get("GROQ_API_KEY", "").strip()
    model = os.environ.get("GROQ_MODEL", DEFAULT_MODEL).strip() or DEFAULT_MODEL
    if not api_key:
        raise TrainingUnavailable("GROQ_API_KEY is not set in backend/.env")
    prompt = build_drill_prompt(area, level)
    last_error = None
    for _ in range(2):
        try:
            old = training.SYSTEM_PROMPT
            training.SYSTEM_PROMPT = DRILL_SYSTEM_PROMPT
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
            return validate_messages(_extract_json(text))
        except Exception as e:
            last_error = e
    raise TrainingUnavailable(f"Could not create the evaluation messages right now. ({last_error})")


# ---------------------------------------------------------------------
# Scheduling
# ---------------------------------------------------------------------
def _encode_user(user_id):
    return base64.urlsafe_b64encode(user_id.encode()).decode().rstrip("=")


def _decode_user(text):
    return base64.urlsafe_b64decode(text + "=" * (-len(text) % 4)).decode()


def _click_url(token):
    base = os.environ.get("PUBLIC_BASE_URL", "").strip().rstrip("/")
    return f"{base}/sim/click/{token}"


def _entry(progress, area):
    return progress["checks"].setdefault(area, {"fails": 0, "attempts": [], "current": None})


def ensure_evaluation(progress, area):
    """
    Creates the evaluation (all messages + their delivery times) if the quiz is passed and there
    is none yet. May raise ConsentRequired or TrainingUnavailable.
    """
    entry = _entry(progress, area)
    if not entry.get("quiz_passed") or entry.get("evaluation") is not None:
        return entry.get("evaluation")
    if not progress.get("consent"):
        raise ConsentRequired()
    level = progress["plans"].get(area, {}).get("sebis_level", "Medium")
    messages = _ask_ai_messages(area, level)

    now = _now()
    start = now + timedelta(minutes=_minutes("DRILL_DELAY_MINUTES", 1440))
    period = timedelta(minutes=_minutes("DRILL_PERIOD_MINUTES", 7 * 1440))
    window = timedelta(minutes=max(1, _minutes("MESSAGE_WINDOW_MINUTES", 1440)))
    n = len(messages)
    spacing = period / (n - 1) if n > 1 else timedelta(0)

    prefix = _encode_user(progress["user_id"])
    out, last = [], start
    for i, m in enumerate(messages):
        when = start + spacing * i
        if 0 < i < n - 1 and spacing > timedelta(0):  # slightly random, but never out of order
            when += timedelta(seconds=random.uniform(-0.1, 0.1) * spacing.total_seconds())
        when = max(when, last)
        last = when
        out.append({
            "id": f"m{i + 1}", "token": prefix + "." + secrets.token_urlsafe(10),
            "is_phishing": m["is_phishing"], "message": m,
            "deliver_at": _iso(when), "expires_at": _iso(when + window),
            "notified": False, "channels": [],
            "action": None, "acted_at": None,   # clicked | reported | ignored
        })
    entry["evaluation"] = {"attempt": entry.get("eval_attempts", 0) + 1,
                           "created_at": _iso(now), "messages": out}
    entry["eval_attempts"] = entry["evaluation"]["attempt"]
    save_progress(progress)
    return entry["evaluation"]


# ---------------------------------------------------------------------
# Per-message outcome + debrief
# ---------------------------------------------------------------------
def _outcome(msg):
    a = msg["action"]
    if msg["is_phishing"]:
        return {"clicked": "fell_victim", "reported": "reported", "ignored": "ignored"}[a]
    return {"clicked": "opened_genuine", "reported": "false_alarm", "ignored": "ok"}[a]


def _debrief(msg):
    m = msg["message"]
    return {
        "id": msg["id"], "token": msg["token"], "was_phishing": msg["is_phishing"],
        "outcome": _outcome(msg), "sender": m["sender"], "link_text": m["link_text"],
        "message_text": m["message"], "red_flags": m["red_flags"], "explanation": m["explanation"],
    }


def _view(msg):
    """What the app may show for a message that has been delivered."""
    m = msg["message"]
    view = {
        "id": msg["id"], "channel": m["channel"], "sender": m["sender"], "subject": m["subject"],
        "text": m["message"], "link_text": m["link_text"], "click_url": _click_url(msg["token"]),
        "received_at": msg["deliver_at"], "expires_at": msg["expires_at"],
        "status": "open" if msg["action"] is None else "done",
        "your_action": msg["action"],
    }
    if msg["action"] is not None:       # the reveal only comes AFTER the user has acted / it expired
        view["debrief"] = _debrief(msg)
    return view


# ---------------------------------------------------------------------
# Finishing the evaluation
# ---------------------------------------------------------------------
def _summary(messages):
    phish = [m for m in messages if m["is_phishing"]]
    genuine = [m for m in messages if not m["is_phishing"]]
    fell = sum(m["action"] == "clicked" for m in phish)
    reported = sum(m["action"] == "reported" for m in phish)
    ignored = sum(m["action"] == "ignored" for m in phish)
    false_alarms = sum(m["action"] == "reported" for m in genuine)
    report_rate = round(reported / len(phish), 2) if phish else 1.0
    click_rate = round(fell / len(phish), 2) if phish else 0.0
    passed = (report_rate >= MIN_REPORT_RATE and false_alarms <= MAX_FALSE_ALARMS
              and not (REQUIRE_NO_CLICK and fell > 0))
    return {"phishing_total": len(phish), "genuine_total": len(genuine), "fell_victim": fell,
            "reported": reported, "ignored": ignored, "false_alarms": false_alarms,
            "report_rate": report_rate, "click_rate": click_rate, "passed": passed}


def _finish(progress, area, profile=None):
    entry = _entry(progress, area)
    ev = entry["evaluation"]
    s = _summary(ev["messages"])
    s["rule_passed"] = s["passed"]
    judged = training_eval.evaluate(entry, area, progress["plans"].get(area, {}).get("sebis_level", "Medium"),
                                    s, ev["messages"])
    s["passed"] = judged["decision"] == "mastered"      # rules AND the AI must agree
    result = {
        "state": "resolved", "area": area, "attempt": ev["attempt"], **s,
        "messages": [_debrief(m) for m in ev["messages"]],
        "resolved_at": _iso(_now()), "new_plan_next": False, "next_area": None, "all_done": False,
        "evaluation": judged, "decision": judged["decision"],
    }
    entry.setdefault("evaluations", []).append(
        {"attempt": ev["attempt"], "report_rate": s["report_rate"], "click_rate": s["click_rate"],
         "false_alarms": s["false_alarms"], "passed": s["passed"], "at": result["resolved_at"],
         "proficiency": judged["proficiency"], "level": judged["level"], "decision": judged["decision"]})
    entry["evaluation"] = None

    if s["passed"]:
        if profile is None:
            profile = build_user_profile(progress["user_id"])
        mark_area_completed(progress, area)
        quiz_attempts = entry.get("attempts", [])
        evals = entry["evaluations"]
        progress["history"].append({
            "area": area, "quiz_attempts": len(quiz_attempts), "evaluation_rounds": len(evals),
            "first_quiz_score": quiz_attempts[0]["quiz_score"] if quiz_attempts else None,
            "final_quiz_score": quiz_attempts[-1]["quiz_score"] if quiz_attempts else None,
            "first_report_rate": evals[0]["report_rate"], "final_report_rate": evals[-1]["report_rate"],
            "first_click_rate": evals[0]["click_rate"], "final_click_rate": evals[-1]["click_rate"],
            "first_proficiency": evals[0].get("proficiency"), "final_proficiency": evals[-1].get("proficiency"),
            "final_level": evals[-1].get("level"),
            "passed_at": result["resolved_at"],
        })
        _, nxt = _next_item(profile["training_brief"], progress["completed"]) if profile else (None, None)
        result["next_area"] = nxt["area"] if nxt else None
        result["all_done"] = nxt is None
        result["message"] = (f"Area mastered! {judged['feedback']}"
                             + (f" Your next training area is ready: {_pretty(nxt['area'])}."
                                if nxt else " Your training is finished!"))
    else:
        entry["eval_fails"] = entry.get("eval_fails", 0) + 1
        result["new_plan_next"] = entry["eval_fails"] >= FAILS_BEFORE_NEW_PLAN
        problems = []
        if s["fell_victim"]:
            problems.append(f"you opened {s['fell_victim']} phishing link(s) - in real life that could "
                            "have got you hacked")
        if s["report_rate"] < MIN_REPORT_RATE:
            problems.append(f"you reported only {s['reported']} of {s['phishing_total']} phishing messages")
        if s["false_alarms"] > MAX_FALSE_ALARMS:
            problems.append("you reported too many genuine messages")
        what = ("You did not master this area yet. " + judged["feedback"]
                + (f" Focus: {judged['coaching_focus']}" if judged["coaching_focus"] else ""))
        if result["new_plan_next"]:
            entry["quiz_passed"] = False  # start again from a new, easier plan
            entry["fails"] = FAILS_BEFORE_NEW_PLAN  # makes training.generate_training write a new plan
            result["message"] = what + " We will give you a new, easier plan for this area."
        else:
            result["message"] = what + " Review your steps - you will be evaluated again."
    progress["last_drill_result"] = result
    add_chat(progress, area, "assistant", result["message"], kind="evaluation_result",
             data={"decision": judged["decision"], "proficiency": judged["proficiency"],
                   "level": judged["level"], "evidence": judged["evidence"],
                   "next_area": result["next_area"], "new_plan_next": result["new_plan_next"]})
    save_progress(progress)

    if not s["passed"] and not result["new_plan_next"]:
        try:  # next round straight away (or later, if the AI is down)
            ensure_evaluation(progress, area)
        except (TrainingUnavailable, ConsentRequired):
            pass
    return result


def _refresh(progress, area, profile=None):
    """Closes expired messages; finishes the evaluation if every message is resolved. Returns the result or None."""
    ev = _entry(progress, area).get("evaluation")
    if ev is None:
        return None
    now, changed = _now(), False
    for m in ev["messages"]:
        if m["action"] is None and now > _parse(m["expires_at"]):
            m["action"], m["acted_at"], changed = "ignored", _iso(_parse(m["expires_at"])), True
    if all(m["action"] is not None for m in ev["messages"]):
        return _finish(progress, area, profile)
    if changed:
        save_progress(progress)
    return None


# ---------------------------------------------------------------------
# Public functions (the app / endpoints use these)
# ---------------------------------------------------------------------
def _active(user_id):
    progress = load_progress(user_id)
    area = progress.get("current_area")
    return progress, area, (_entry(progress, area) if area else None)


def set_consent(user_id, accepted=True):
    progress = load_progress(user_id)
    progress["consent"] = bool(accepted)
    save_progress(progress)
    return {"user_id": user_id, "consent": progress["consent"]}


def set_contact(user_id, email=None, push_token=None):
    """Where the messages are sent when the app is closed."""
    if email is not None and not training_notify.valid_email(email):
        raise ValueError("That email address does not look right.")
    if push_token is not None and not training_notify.valid_push_token(push_token):
        raise ValueError("That push token does not look right.")
    progress = load_progress(user_id)
    contact = progress.setdefault("contact", {})
    if email is not None:
        contact["email"] = email
    if push_token is not None:
        contact["push_token"] = push_token
    save_progress(progress)
    return {"user_id": user_id, "email_saved": bool(contact.get("email")),
            "push_saved": bool(contact.get("push_token"))}


@locked
def get_drill(user_id, profile=None):
    """
    none | consent_required | preparing | scheduled | in_progress | resolved
    The inbox only holds messages that have already been delivered. How many messages there are,
    and when the next one comes, is NOT revealed.
    """
    progress, area, entry = _active(user_id)
    last = progress.get("last_drill_result")
    if area is None or not entry.get("quiz_passed"):
        return {"state": "none", "last_result": last,
                "message": "Your progress check starts after you pass the quiz."}
    try:
        ev = ensure_evaluation(progress, area)
    except ConsentRequired:
        return {"state": "consent_required", "last_result": last,
                "message": "To continue, please agree that CyberShield may test your skills with "
                           "simulated security messages."}
    except TrainingUnavailable:
        return {"state": "preparing", "last_result": last,
                "message": "Your progress check is being prepared. Please check again in a moment."}
    if ev is None:
        return {"state": "none", "last_result": last}

    result = _refresh(progress, area, profile)
    if result:
        return result
    ev = _entry(progress, area)["evaluation"]
    now = _now()
    inbox = [_view(m) for m in ev["messages"] if now >= _parse(m["deliver_at"])]
    if not inbox:
        return {"state": "scheduled", "area": area, "last_result": last,
                "message": "Your progress check is in progress. Keep practising your steps."}
    return {"state": "in_progress", "area": area, "attempt": ev["attempt"], "inbox": inbox,
            "last_result": last,
            "message": "Your progress check is in progress. Keep practising your steps."}


def _act(user_id, message_id, action, profile=None):
    state = get_drill(user_id)
    if state["state"] == "resolved":
        return {"debrief": None, "evaluation_finished": True, "result": state}
    if state["state"] != "in_progress":
        raise ValueError("There is no message waiting for you right now.")
    progress, area, entry = _active(user_id)
    msg = next((m for m in entry["evaluation"]["messages"] if m["id"] == message_id), None)
    if msg is None or message_id not in {v["id"] for v in state["inbox"]}:
        raise ValueError("That message was not found.")
    if msg["action"] is not None:
        return {"debrief": _debrief(msg), "evaluation_finished": False, "result": None}
    msg["action"], msg["acted_at"] = action, _iso(_now())
    debrief = _debrief(msg)
    result = _refresh(progress, area, profile)
    if result is None:
        save_progress(progress)
    return {"debrief": debrief, "evaluation_finished": result is not None, "result": result}


@locked
def click_message(user_id, message_id, profile=None):
    """The user tapped the link inside a message."""
    return _act(user_id, message_id, "clicked", profile)


@locked
def report_message(user_id, message_id, profile=None):
    """The user reported a message as phishing."""
    return _act(user_id, message_id, "reported", profile)


@locked
def force_ignore(user_id, message_id):
    """TESTING helper (terminal only): the user did nothing and the time ran out."""
    return _act(user_id, message_id, "ignored")


@locked
def click_by_token(token):
    """Tracking link /sim/click/<token> (also works from an email). Returns a debrief dict, or None."""
    try:
        user_id = _decode_user(token.split(".", 1)[0])
    except Exception:
        return None
    progress, area, entry = _active(user_id)
    ev = entry.get("evaluation") if entry else None
    if ev:
        msg = next((m for m in ev["messages"] if m["token"] == token), None)
        if msg:
            if msg["action"] is None and _now() >= _parse(msg["deliver_at"]):
                done = _act(user_id, msg["id"], "clicked")
                return done["debrief"]
            return _debrief(msg) if msg["action"] is not None else None
    last = progress.get("last_drill_result") or {}
    return next((d for d in last.get("messages", []) if d["token"] == token), None)


# ---------------------------------------------------------------------
# The timer (called every minute by main.py): send due messages, close expired ones
# ---------------------------------------------------------------------
@locked
def process_user(user_id):
    """Sends the messages that are due on the user's channels. Returns how many were sent."""
    progress, area, entry = _active(user_id)
    if area is None or not entry.get("quiz_passed"):
        return 0
    get_drill(user_id)  # creates the evaluation if needed + closes expired messages
    progress, area, entry = _active(user_id)
    ev = entry.get("evaluation") if entry else None
    if not ev:
        return 0
    sent, now = 0, _now()
    for m in ev["messages"]:
        if m["action"] is None and not m["notified"] and now >= _parse(m["deliver_at"]):
            m["channels"] = training_notify.notify(progress.get("contact"), _view(m))
            m["notified"] = True
            sent += 1
    if sent:
        save_progress(progress)
    return sent


def process_all():
    if not os.path.isdir(RESULTS_DIR):
        return 0
    total = 0
    for name in os.listdir(RESULTS_DIR):
        if name.endswith("_progress.json"):
            try:
                with open(os.path.join(RESULTS_DIR, name), encoding="utf-8") as f:
                    user_id = json.load(f).get("user_id")
                if user_id:
                    total += process_user(user_id)
            except Exception as e:  # one broken file must never stop the timer
                print(f"[drill timer] {name}: {e}")
    return total


# ---------------------------------------------------------------------
# The page shown when someone opens the tracking link
# ---------------------------------------------------------------------
def render_click_page(d):
    if not d:
        body = "<h1>Link not found</h1><p>This link is no longer active.</p>"
    elif d["was_phishing"]:
        flags = "".join(f"<li>{html.escape(f)}</li>" for f in d.get("red_flags", []))
        body = (
            "<h1>&#9888; This was a phishing SIMULATION</h1>"
            f"<p>You opened the link in a message from <b>{html.escape(d['sender'])}</b>. "
            "A real attacker could now have stolen your password or installed malware.</p>"
            "<p><b>Nothing bad happened - this was part of your CyberShield training.</b></p>"
            f"<h2>What gave it away</h2><ul>{flags}</ul><p>{html.escape(d['explanation'])}</p>"
            "<h2>What to do next time</h2><p>Do not tap the link. Report the message as phishing.</p>")
    else:
        body = (
            "<h1>&#10003; This message was genuine</h1>"
            f"<p>The message from <b>{html.escape(d['sender'])}</b> was a normal one, so opening it was fine.</p>"
            f"<p>{html.escape(d['explanation'])}</p>"
            "<p>This was part of your CyberShield training: it is just as important to trust genuine "
            "messages as it is to spot phishing ones.</p>")
    return ("<!doctype html><html><head><meta charset='utf-8'>"
            "<meta name='viewport' content='width=device-width,initial-scale=1'>"
            "<title>CyberShield training</title>"
            "<style>body{font-family:Arial,sans-serif;max-width:560px;margin:24px auto;padding:0 16px;"
            "color:#1a1a1a;line-height:1.5}h1{font-size:22px}h2{font-size:17px;margin-top:22px}</style>"
            "</head><body>" + body + "</body></html>")