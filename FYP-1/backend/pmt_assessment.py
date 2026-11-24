"""
CyberShield - PMT Assessment (Protection Motivation Theory + Supabase Storage)
"""

from pmt_scoring import PMT_ITEMS, build_profile
from supabase_results import (
    save_assessment_result,
    get_latest_assessment_result,
    get_assessment_result_by_id,
)

TABLE_NAME = "pmt_results"

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
    """CLI only: asks all 30 statements one at a time in the terminal."""
    print("=== PMT Protection Motivation Questionnaire ===")
    print("Say how much you agree with each statement (1 to 7):")
    print("  ".join(f"{k} = {v}" for k, v in SCALE_LABELS.items()) + "\n")

    answers = {}
    for i, item in enumerate(PMT_ITEMS, start=1):
        while True:
            raw = input(f"Q{i}. {item['text']}\n> ")
            if raw in [str(n) for n in range(1, 8)]:
                answers[item["id"]] = int(raw)
                break
            print("Please enter a number from 1 to 7.\n")
    return answers


def print_profile(user_id, profile):
    print(f"\n=== PMT Profile for: {user_id} ===")
    print("Construct scores:", profile["construct_scores"])
    print("Construct levels:", profile["construct_levels"])
    print("Threat appraisal: ", profile["threat_appraisal_score"])
    print("Coping appraisal: ", profile["coping_appraisal_score"])
    print("Overall score:    ", profile["overall_score"], f"({profile['overall_level']})")
    print("Weakest area:     ", profile["weakest_area"])


def save_result(user_id, answers, profile, assessment_id=None):
    """Saves this PMT result to the `pmt_results` table in Supabase."""
    return save_assessment_result(
        table_name=TABLE_NAME,
        user_id=user_id,
        answers=answers,
        profile=profile,
        assessment_id=assessment_id,
        extra_columns={
            "threat_appraisal_score": profile.get("threat_appraisal_score"),
            "coping_appraisal_score": profile.get("coping_appraisal_score"),
            "construct_scores": profile["construct_scores"],
            "construct_levels": profile["construct_levels"],
        },
    )


def get_latest_result(user_id):
    """Returns this user's most recent saved PMT result from Supabase, or None."""
    return get_latest_assessment_result(TABLE_NAME, user_id)


def get_result_by_id(assessment_id):
    """Retrieves one saved PMT result by its assessment_id from Supabase."""
    return get_assessment_result_by_id(TABLE_NAME, assessment_id)


def print_linked_result(sebis_record, pmt_profile):
    """Prints how this person's SeBIS behavior connects to their PMT motivation."""
    from theory_linking import link_sebis_to_pmt

    links = link_sebis_to_pmt(sebis_record["profile"], pmt_profile)
    print("\n=== SeBIS (behavior)  <->  PMT (motivation) ===")
    for area, info in links["areas"].items():
        barrier = info["likely_barrier"] or "none found"
        print(f"  {area}: {info['sebis_score']} ({info['sebis_level']})  | likely barrier: {barrier}")
        for r in info["related_constructs"]:
            print(f"      - {r['construct']}: {r['score']} ({r['level']})")
    print(f"\n  {links['focus']['message']}")


if __name__ == "__main__":
    from sebis_assessment import get_latest_result as get_latest_sebis

    user_id = ""
    while not user_id:
        user_id = input("Enter the SAME user ID you used for SeBIS: ").strip()

    sebis_record = get_latest_sebis(user_id)
    answers = collect_answers_from_user()
    profile = build_profile(answers)
    print_profile(user_id, profile)

    record = save_result(user_id, answers, profile)
    print(f"\nSaved to Supabase ({TABLE_NAME}): {record['assessment_id']}")

    if sebis_record is not None:
        print_linked_result(sebis_record, profile)