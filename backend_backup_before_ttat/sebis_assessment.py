"""
CyberShield - SeBIS Assessment (Questionnaire + Scoring + Save Results)

SeBIS only. This is NOT a test and there is NO retake: it simply records
how a person usually behaves around their devices (their everyday
cybersecurity practices). The saved result is later linked to the PMT
questionnaire (see pmt_assessment.py and theory_linking.py).

This file:
  1. Welcomes the user and asks for a name/ID (so results can be told apart).
  2. Asks all 16 real SeBIS questions, one at a time (answer 1-5).
  3. Uses the scoring engine (sebis_scoring.py) to calculate the profile.
  4. Prints a clean, presentable summary.
  5. Saves the result to a JSON file in the "results" folder - a
     stand-in for the real database, which comes later.

It is used BOTH by the command line (run this file directly) and by the
FastAPI backend (main.py), which calls build_profile(), save_result()
and get_latest_result() directly.

Requires sebis_scoring.py to be in the same folder.
Run it from inside the backend folder:  python sebis_assessment.py
"""

import json
import os
import re
from datetime import datetime

from sebis_scoring import SEBIS_ITEMS, build_profile

RESULTS_DIR = "results"


def collect_answers_from_user():
    """Asks all 16 questions one at a time and collects real typed answers."""
    print("=== SeBIS Security Behavior Questionnaire ===")
    print("Answer each question with a number:")
    print("1 = Never   2 = Rarely   3 = Sometimes   4 = Often   5 = Always\n")

    answers = {}
    for i, item in enumerate(SEBIS_ITEMS, start=1):
        while True:
            raw = input(f"Q{i}. {item['text']}\n> ")
            if raw in ["1", "2", "3", "4", "5"]:
                answers[item["id"]] = int(raw)
                break
            print("Please enter a number from 1 to 5.\n")
    return answers


def print_profile(user_id, profile):
    print(f"\n=== Security Profile for: {user_id} ===")
    print("Subscale scores:", profile["subscale_scores"])
    print("Subscale levels:", profile["subscale_levels"])
    print("Overall score:  ", profile["overall_score"], f"({profile['overall_level']})")
    print("Weakest area:   ", profile["weakest_area"])


def save_result(user_id, answers, profile, assessment_id=None):
    """
    Saves this result to a JSON file, acting as a stand-in for the
    database. Returns the full saved record (including its
    assessment_id) so the caller (CLI or API) can use it.
    """
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
    """
    Returns this user's most recent saved SeBIS result, or None if they
    have none. Used to link SeBIS with PMT - it is NOT used to compare
    attempts (there is no retake).

    The filename must be exactly "<user_id>_<timestamp>.json", so a user
    called "test" is never confused with a user called "test_user".

    NOTE: file-based stand-in for a future database query - only this
    function and save_result() will need to change once a real database
    exists.
    """
    if not os.path.isdir(RESULTS_DIR):
        return None

    pattern = re.compile(
        rf"^{re.escape(user_id)}_\d{{4}}-\d{{2}}-\d{{2}}_\d{{2}}-\d{{2}}-\d{{2}}\.json$"
    )
    matches = [f for f in os.listdir(RESULTS_DIR) if pattern.match(f)]
    if not matches:
        return None

    matches.sort()  # timestamps in the filename sort chronologically
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
# Theory-linking (PMT) - see theory_linking.py
# Takes the SeBIS profile built above, plus the user's PMT profile if they
# have completed it, and returns the SeBIS profile with a "theory_links"
# section added. The mapping itself is a DRAFT until the supervisor
# approves it, and lives in theory_linking.py (SEBIS_TO_PMT).
# TPB / TTAT are not linked yet.
# ---------------------------------------------------------------------
def link_to_theories(profile, pmt_profile=None):
    from theory_linking import link_sebis_to_pmt
    linked = dict(profile)
    linked["theory_links"] = link_sebis_to_pmt(profile, pmt_profile)
    return linked


# ---------------------------------------------------------------------
# Run this file directly to answer the questionnaire in the terminal.
# ---------------------------------------------------------------------
if __name__ == "__main__":
    print("=== Welcome to CyberShield ===")
    print("We are not testing you - we just want to understand how you usually")
    print("behave around your devices. There are no right or wrong answers.\n")

    user_id = ""
    while not user_id:
        user_id = input("Enter your name or ID: ").strip()

    print(f"\nHi {user_id}, let's begin.\n")

    answers = collect_answers_from_user()
    profile = build_profile(answers)

    print_profile(user_id, profile)

    record = save_result(user_id, answers, profile)
    print(f"\nSaved to {RESULTS_DIR}/{record['assessment_id']}.json")
    print("\nNext step: run  python pmt_assessment.py  and enter the same name")
    print("to continue to the PMT questions and see how the two connect.")
