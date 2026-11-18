"""
CyberShield - SeBIS Assessment (Questionnaire + Scoring + Supabase Storage)
"""

from sebis_scoring import SEBIS_ITEMS, build_profile
from supabase_results import (
    save_assessment_result,
    get_latest_assessment_result,
    get_assessment_result_by_id,
)

TABLE_NAME = "sebis_results"


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
    """Saves this SeBIS result to the `sebis_results` table in Supabase."""
    return save_assessment_result(
        table_name=TABLE_NAME,
        user_id=user_id,
        answers=answers,
        profile=profile,
        assessment_id=assessment_id,
        extra_columns={
            "subscale_scores": profile["subscale_scores"],
            "subscale_levels": profile["subscale_levels"],
        },
    )


def get_latest_result(user_id):
    """Returns this user's most recent saved SeBIS result from Supabase, or None."""
    return get_latest_assessment_result(TABLE_NAME, user_id)


def get_result_by_id(assessment_id):
    """Retrieves one saved SeBIS result by its assessment_id from Supabase."""
    return get_assessment_result_by_id(TABLE_NAME, assessment_id)


def link_to_theories(profile, pmt_profile=None):
    from theory_linking import link_sebis_to_pmt
    linked = dict(profile)
    linked["theory_links"] = link_sebis_to_pmt(profile, pmt_profile)
    return linked


if __name__ == "__main__":
    print("=== Welcome to CyberShield ===")
    user_id = ""
    while not user_id:
        user_id = input("Enter your user ID: ").strip()

    answers = collect_answers_from_user()
    profile = build_profile(answers)
    print_profile(user_id, profile)

    record = save_result(user_id, answers, profile)
    print(f"\nSaved to Supabase ({TABLE_NAME}): {record['assessment_id']}")