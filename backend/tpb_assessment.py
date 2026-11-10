"""
CyberShield - TPB Assessment (Theory of Planned Behavior)

Same flow as the PMT assessment: 14 statements on a 7-point scale. Results
are saved in their own folder, results_tpb/. The result is then combined
with the person's SeBIS and PMT results by profiling.py.

There is NO retake and no comparison between attempts.

Used BOTH by the command line (run this file directly) and by the FastAPI
backend (main.py).

Run it from inside the backend folder:  python tpb_assessment.py
(Do the SeBIS questionnaire first, using the same name.)
"""

import json
import os
import re
from datetime import datetime

from tpb_scoring import TPB_ITEMS, build_profile

RESULTS_DIR = "results_tpb"

SCALE_LABELS = {
    1: "Strongly disagree",
    2: "Disagree",
    3: "Somewhat disagree",
    4: "Neutral",
    5: "Somewhat agree",
    6: "Agree",
    7: "Strongly agree",
}


def collect_answers_from_user():
    """CLI only: asks all 14 statements one at a time in the terminal."""
    print("=== TPB Questionnaire ===")
    print("Say how much you agree with each statement (1 to 7):")
    print("  ".join(f"{k} = {v}" for k, v in SCALE_LABELS.items()) + "\n")

    answers = {}
    for i, item in enumerate(TPB_ITEMS, start=1):
        while True:
            raw = input(f"Q{i}. {item['text']}\n> ")
            if raw in [str(n) for n in range(1, 8)]:
                answers[item["id"]] = int(raw)
                break
            print("Please enter a number from 1 to 7.\n")
    return answers


def print_profile(user_id, profile):
    print(f"\n=== TPB Profile for: {user_id} ===")
    print("Construct scores:", profile["construct_scores"])
    print("Construct levels:", profile["construct_levels"])
    print("Overall score:   ", profile["overall_score"], f"({profile['overall_level']})")
    print("Weakest area:    ", profile["weakest_area"])


def save_result(user_id, answers, profile, assessment_id=None):
    """Saves this result to a JSON file (stand-in for the database)."""
    os.makedirs(RESULTS_DIR, exist_ok=True)
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    if assessment_id is None:
        assessment_id = f"{user_id}_{timestamp}"
    filename = f"{RESULTS_DIR}/{assessment_id}.json"

    record = {
        "assessment_id": assessment_id,
        "user_id": user_id,
        "timestamp": timestamp,
        "answers": answers,
        "profile": profile,
    }
    with open(filename, "w") as f:
        json.dump(record, f, indent=2)
    return record


def get_latest_result(user_id):
    """Most recent saved TPB result for this user, or None."""
    if not os.path.isdir(RESULTS_DIR):
        return None
    pattern = re.compile(
        rf"^{re.escape(user_id)}_\d{{4}}-\d{{2}}-\d{{2}}_\d{{2}}-\d{{2}}-\d{{2}}\.json$"
    )
    matches = sorted(f for f in os.listdir(RESULTS_DIR) if pattern.match(f))
    if not matches:
        return None
    with open(os.path.join(RESULTS_DIR, matches[-1])) as f:
        return json.load(f)


def get_result_by_id(assessment_id):
    """Retrieves one saved result by its assessment_id."""
    filename = f"{RESULTS_DIR}/{assessment_id}.json"
    if not os.path.isfile(filename):
        return None
    with open(filename) as f:
        return json.load(f)


# ---------------------------------------------------------------------
# Run this file directly to answer the TPB questions in the terminal.
# ---------------------------------------------------------------------
if __name__ == "__main__":
    from sebis_assessment import get_latest_result as get_latest_sebis
    from profiling import build_user_profile, print_user_profile

    print("=== CyberShield - TPB Questions ===")
    print("These statements are about your attitude, the people around you and")
    print("how much in control you feel. There are no right or wrong answers.\n")

    user_id = ""
    while not user_id:
        user_id = input("Enter the SAME name or ID you used for SeBIS: ").strip()

    if get_latest_sebis(user_id) is None:
        print(f"\nNo SeBIS result found for '{user_id}'. You can still answer, but")
        print("the user profile needs SeBIS first (run: python sebis_assessment.py).\n")

    answers = collect_answers_from_user()
    profile = build_profile(answers)
    print_profile(user_id, profile)

    record = save_result(user_id, answers, profile)
    print(f"\nSaved to {RESULTS_DIR}/{record['assessment_id']}.json")

    user_profile = build_user_profile(user_id)
    if user_profile is not None:
        print_user_profile(user_profile)
