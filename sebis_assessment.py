"""
CyberShield - SeBIS Assessment (Questionnaire + Scoring + Save Results)

SCOPE OF THIS FILE (as instructed by supervisor): SeBIS only.
No PMT / TPB / TTAT questions or logic here yet - that has not been
approved by the supervisor. A clearly marked placeholder is left near
the bottom so theory-linking can be added later WITHOUT needing to
touch or rewrite any of the SeBIS code above it.

This file:
  1. Asks the user for a name/ID (so results can be told apart).
  2. Asks all 16 real SeBIS questions, one at a time.
  3. Uses the scoring engine (sebis_scoring.py) to calculate the profile.
  4. Prints a clean, presentable summary.
  5. Saves the result to a JSON file in a "results" folder - a
     stand-in for the real database, which comes later (Phase 5).

Requires sebis_scoring.py to be in the same folder.
"""

import json
import os
from datetime import datetime

from sebis_scoring import SEBIS_ITEMS, build_profile


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


def get_previous_result(user_id):
    """
    Looks in the results folder for this user's most recent PAST
    assessment (if any). Returns None if this is their first attempt.

    NOTE: this is a file-based stand-in for what will later be a
    simple database query ("get this user's last assessment") once
    the real database exists (Phase 5) - only this function will
    need to change then, nothing else in this file.
    """
    if not os.path.isdir("results"):
        return None

    matches = [f for f in os.listdir("results") if f.startswith(f"{user_id}_")]
    if not matches:
        return None

    matches.sort()  # timestamps in the filename sort chronologically
    latest_file = matches[-1]

    with open(os.path.join("results", latest_file)) as f:
        return json.load(f)


def compare_profiles(previous_record, current_profile):
    """
    Compares the current profile against the user's last attempt.
    Returns a dict showing how each subscale changed.
    """
    prev_scores = previous_record["profile"]["subscale_scores"]
    curr_scores = current_profile["subscale_scores"]

    changes = {}
    for subscale in curr_scores:
        diff = round(curr_scores[subscale] - prev_scores[subscale], 2)
        changes[subscale] = {
            "previous": prev_scores[subscale],
            "current": curr_scores[subscale],
            "change": diff,
            "improved": diff > 0,
        }

    overall_diff = round(
        current_profile["overall_score"] - previous_record["profile"]["overall_score"], 2
    )
    changes["overall"] = {
        "previous": previous_record["profile"]["overall_score"],
        "current": current_profile["overall_score"],
        "change": overall_diff,
        "improved": overall_diff > 0,
    }
    return changes


def print_comparison(changes):
    print("\n=== Progress Since Last Attempt ===")
    for subscale, c in changes.items():
        if subscale == "overall":
            continue
        arrow = "UP" if c["improved"] else ("DOWN" if c["change"] < 0 else "SAME")
        print(f"  {subscale}: {c['previous']} -> {c['current']}  ({arrow} {c['change']:+.2f})")

    overall = changes["overall"]
    arrow = "UP" if overall["improved"] else ("DOWN" if overall["change"] < 0 else "SAME")
    print(f"\n  Overall: {overall['previous']} -> {overall['current']}  ({arrow} {overall['change']:+.2f})")


def save_result(user_id, answers, profile, attempt_number):
    """
    Saves this assessment to a JSON file, acting as a stand-in for the
    database until the real backend/database (Phase 5) is built.
    """
    os.makedirs("results", exist_ok=True)
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"results/{user_id}_{timestamp}.json"

    record = {
        "user_id": user_id,
        "timestamp": timestamp,
        "attempt_number": attempt_number,
        "answers": answers,
        "profile": profile,
    }

    with open(filename, "w") as f:
        json.dump(record, f, indent=2)

    print(f"\nSaved to {filename}")
    return filename


# ---------------------------------------------------------------------
# PLACEHOLDER FOR LATER: Theory-linking (PMT / TPB / TTAT)
#
# This is intentionally left empty. Once the supervisor approves the
# theory questions/logic, this is where it will be added - it will
# take the `profile` dict already built above (subscale_scores,
# subscale_levels, weakest_area) and attach theory labels to it.
# Nothing above this needs to change when that happens.
# ---------------------------------------------------------------------
def link_to_theories(profile):
    # TODO: implement after supervisor approves PMT/TPB/TTAT mapping.
    return profile


# ---------------------------------------------------------------------
# Run this file directly to take the questionnaire yourself.
# ---------------------------------------------------------------------
if __name__ == "__main__":
    user_id = input("Enter your name or ID: ").strip()

    previous_record = get_previous_result(user_id)
    attempt_number = (previous_record["attempt_number"] + 1) if previous_record else 1

    if previous_record:
        print(f"\nWelcome back, {user_id}. This is attempt #{attempt_number} (reassessment).")
    else:
        print(f"\nHi {user_id}, this is your first (baseline) assessment.")

    answers = collect_answers_from_user()
    profile = build_profile(answers)

    print_profile(user_id, profile)

    if previous_record:
        changes = compare_profiles(previous_record, profile)
        print_comparison(changes)

    save_result(user_id, answers, profile, attempt_number)