"""
CyberShield - Behaviour evaluation (hybrid: CODE calculates, the AI judges)

After the 4 simulated messages are resolved, this module decides:  Mastered  or  Needs coaching.

  1. CODE computes the numbers (they cannot be argued with):
       simulation score (0-100):  phishing reported = 1, ignored = 0.5, clicked = 0
                                  genuine opened / ignored = 1, reported (false alarm) = 0.5
       proficiency (0-100)     =  30 % quiz score  +  70 % simulation score
       level                   =  < 50 Low,  50-79 Medium,  >= 80 High
       rule verdict            =  the pass rule of training_drill.py (no clicks, >= 2/3 reported ...)
  2. The AI (Groq) receives ONLY these numbers (no name, no id) and writes the decision JSON.
     The AI may be STRICTER than the rules (e.g. "needs coaching" although the rules passed),
     but it can never pass someone the rules failed.
  3. If the AI is down, the rule verdict decides and a simple feedback text is written by code.

Result:  {decision, proficiency, level, improved, evidence, coaching_focus, feedback, ai_used}
"""

import json

from training import TrainingUnavailable, _extract_json, _pretty, llm_complete

W_QUIZ, W_SIM = 0.30, 0.70

EVAL_SYSTEM_PROMPT = (
    "You are the evaluator of a cybersecurity training programme. You receive numbers about how a "
    "person behaved in simulated phishing messages and decide whether they really apply their training. "
    "Be fair but strict: clicking a phishing link is a serious failure. Never invent facts that are not "
    "in the data. Write feedback in simple, kind English addressed to the person ('you'). "
    "Answer with JSON only."
)


def level_of(points):
    return "Low" if points < 50 else ("Medium" if points < 80 else "High")


def simulation_points(messages):
    """messages: list of {is_phishing, action}. Returns 0-100."""
    pts = []
    for m in messages:
        if m["is_phishing"]:
            pts.append({"reported": 1.0, "ignored": 0.5, "clicked": 0.0}[m["action"]])
        else:
            pts.append({"clicked": 1.0, "ignored": 1.0, "reported": 0.5}[m["action"]])
    return round(100 * sum(pts) / len(pts), 1) if pts else 0.0


def _quiz_score(entry):
    attempts = entry.get("attempts", [])
    return round(100 * attempts[-1]["quiz_score"], 1) if attempts else 0.0


def _before_after(entry, sim, proficiency):
    """Compare with the previous evaluation round of this area, if there was one."""
    evals = entry.get("evaluations", [])
    prev = evals[-1].get("proficiency") if evals else None
    return prev, (None if prev is None else round(proficiency - prev, 1))


def build_eval_prompt(area, level_before, data):
    return (
        "Evaluate this person's real-life behaviour after training in the security area below.\n"
        "Rules: 'mastered' only if they clicked NO phishing link, reported most phishing messages, and did "
        "not raise too many false alarms. Otherwise 'needs_coaching'. 'improved' is true if the proficiency "
        "is higher than before (or, on the first round, if proficiency is Medium or High).\n"
        "'evidence' = 2 to 3 short facts taken from the numbers. 'coaching_focus' = one short sentence "
        "(empty if mastered). 'feedback_to_user' = 2 to 3 friendly sentences.\n"
        "Return ONLY this JSON shape:\n"
        '{"decision":"mastered","improved":true,"evidence":["..",".."],"coaching_focus":"","feedback_to_user":".."}\n\n'
        "Data:\n" + json.dumps({"area": _pretty(area), "level_before_training": level_before, **data}, indent=2)
    )


def _fallback_feedback(summary, passed):
    if passed:
        return (f"You reported {summary['reported']} of {summary['phishing_total']} phishing messages "
                "and did not fall for any. You are using your training in real life.")
    parts = []
    if summary["fell_victim"]:
        parts.append(f"you opened {summary['fell_victim']} phishing link(s)")
    if summary["report_rate"] < 0.66:
        parts.append(f"you reported only {summary['reported']} of {summary['phishing_total']}")
    if summary["false_alarms"] > 1:
        parts.append("you reported too many genuine messages")
    return "Not yet: " + "; ".join(parts or ["your results were not strong enough"]) + ". Let's practise more."


def evaluate(entry, area, level_before, summary, messages):
    """
    entry = progress["checks"][area]; summary = training_drill._summary(...); messages = resolved messages.
    Returns the result dict described at the top of this file.
    """
    sim = simulation_points(messages)
    quiz = _quiz_score(entry)
    proficiency = round(W_QUIZ * quiz + W_SIM * sim, 1)
    prev, change = _before_after(entry, sim, proficiency)
    rule_pass = bool(summary["passed"])

    result = {
        "decision": "mastered" if rule_pass else "needs_coaching",
        "proficiency": proficiency, "level": level_of(proficiency),
        "quiz_score": quiz, "simulation_score": sim,
        "previous_proficiency": prev, "change": change,
        "improved": bool(prev is None and proficiency >= 50 or (change or 0) > 0),
        "evidence": [], "coaching_focus": "",
        "feedback": _fallback_feedback(summary, rule_pass), "ai_used": False,
    }

    data = {
        "quiz_score_percent": quiz, "simulation_score_percent": sim, "proficiency_percent": proficiency,
        "proficiency_before": prev,
        "phishing_messages": summary["phishing_total"], "phishing_clicked": summary["fell_victim"],
        "phishing_reported": summary["reported"], "phishing_ignored": summary["ignored"],
        "genuine_messages": summary["genuine_total"], "false_reports": summary["false_alarms"],
        "rule_verdict": "pass" if rule_pass else "fail",
    }
    try:
        text = llm_complete(
            [{"role": "system", "content": EVAL_SYSTEM_PROMPT},
             {"role": "user", "content": build_eval_prompt(area, level_before, data)}],
            json_mode=True, temperature=0.2)
        ai = _extract_json(text)
        decision = ai.get("decision")
        if decision not in ("mastered", "needs_coaching"):
            raise ValueError("bad decision")
        if decision == "needs_coaching":
            result["decision"] = "needs_coaching"          # AI may be stricter, never softer
        result["evidence"] = [str(e).strip() for e in ai.get("evidence", []) if str(e).strip()][:3]
        result["coaching_focus"] = str(ai.get("coaching_focus", "")).strip() if result["decision"] != "mastered" else ""
        feedback = str(ai.get("feedback_to_user", "")).strip()
        if feedback:
            result["feedback"] = feedback
        if isinstance(ai.get("improved"), bool):
            result["improved"] = ai["improved"]
        result["ai_used"] = True
    except (TrainingUnavailable, ValueError, AttributeError, TypeError):
        pass  # keep the rule-based result
    return result