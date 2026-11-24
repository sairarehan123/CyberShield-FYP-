"""
CyberShield - TPB Assessment (Theory of Planned Behavior + Supabase Storage)
"""

from tpb_scoring import TPB_ITEMS, build_profile
from supabase_results import (
    save_assessment_result,
    get_latest_assessment_result,
    get_assessment_result_by_id,
)

TABLE_NAME = "tpb_results"

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
    """Saves this TPB result to the `tpb_results` table in Supabase."""
    return save_assessment_result(
        table_name=TABLE_NAME,
        user_id=user_id,
        answers=answers,
        profile=profile,
        assessment_id=assessment_id,
        extra_columns={
            "construct_scores": profile["construct_scores"],
            "construct_levels": profile["construct_levels"],
        },
    )


def get_latest_result(user_id):
    """Most recent saved TPB result from Supabase for this user, or None."""
    return get_latest_assessment_result(TABLE_NAME, user_id)


def get_result_by_id(assessment_id):
    """Retrieves one saved TPB result by its assessment_id from Supabase."""
    return get_assessment_result_by_id(TABLE_NAME, assessment_id)


if __name__ == "__main__":
    from profiling import build_user_profile, print_user_profile

    user_id = ""
    while not user_id:
        user_id = input("Enter the SAME user ID you used for SeBIS: ").strip()

    answers = collect_answers_from_user()
    profile = build_profile(answers)
    print_profile(user_id, profile)

    record = save_result(user_id, answers, profile)
    print(f"\nSaved to Supabase ({TABLE_NAME}): {record['assessment_id']}")

    user_profile = build_user_profile(user_id)
    if user_profile is not None:
        print_user_profile(user_profile)