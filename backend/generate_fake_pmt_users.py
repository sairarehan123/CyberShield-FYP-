"""
CyberShield - Generate 500 Fake PMT Users for Testing

Same idea as generate_fake_users.py (SeBIS): 500 fake respondents with VARIED answer patterns,
scored by the REAL scoring engine (pmt_scoring.py), saved to one CSV, plus a summary so the team
can check whether the Low/Medium/High cutoffs make sense.

LINKED TO SeBIS: if fake_users_500.csv (the SeBIS fake users) is in the same folder, fake_user_N
gets a PMT "motivation" level that follows that user's SeBIS overall score (plus noise), so the
two datasets describe the SAME fake people. Without that file, motivation is random.

Requires pmt_scoring.py in the same folder.
Run:  python generate_fake_pmt_users.py
"""

import csv
import os
import random

from pmt_scoring import PMT_ITEMS, build_profile

NUM_FAKE_USERS = 500
SEBIS_CSV = "fake_users_500.csv"
OUT_CSV = "fake_pmt_users_500.csv"
random.seed(42)  # same file every time you run it


def load_sebis_overall():
    """{user_id: SeBIS overall score} from the SeBIS fake-user file, or {} if not there."""
    if not os.path.exists(SEBIS_CSV):
        return {}
    with open(SEBIS_CSV, newline="") as f:
        return {r["user_id"]: float(r["overall_score"]) for r in csv.DictReader(f)}


def generate_one_fake_user(motivation):
    """
    motivation: 0.0 (very unmotivated) to 1.0 (very motivated to stay safe).
    Answers on the 1-7 scale lean toward that level, with noise. Reverse-worded items
    (response cost) are flipped so a motivated person answers LOW on them.
    """
    answers = {}
    for item in PMT_ITEMS:
        base = 1 + motivation * 6
        value = max(1, min(7, round(base + random.uniform(-1.5, 1.5))))
        answers[item["id"]] = 8 - value if item["reverse"] else value
    return answers


def generate_fake_dataset(n=NUM_FAKE_USERS):
    sebis = load_sebis_overall()
    rows = []
    for i in range(1, n + 1):
        user_id = f"fake_user_{i}"
        if user_id in sebis:
            # SeBIS overall is 1-5 -> 0-1, then add noise so PMT is related but not identical
            motivation = max(0.0, min(1.0, (sebis[user_id] - 1) / 4 + random.uniform(-0.2, 0.2)))
        else:
            motivation = random.betavariate(2, 2)

        answers = generate_one_fake_user(motivation)
        profile = build_profile(answers)

        row = {"user_id": user_id}
        row.update(answers)
        for c, s in profile["construct_scores"].items():
            row[f"{c}_score"] = s
        row["threat_appraisal_score"] = profile["threat_appraisal_score"]
        row["coping_appraisal_score"] = profile["coping_appraisal_score"]
        row["overall_score"] = profile["overall_score"]
        row["overall_level"] = profile["overall_level"]
        row["weakest_area"] = profile["weakest_area"]
        if user_id in sebis:
            row["sebis_overall_score"] = sebis[user_id]
        rows.append(row)
    return rows


def save_to_csv(rows, filename=OUT_CSV):
    with open(filename, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    print(f"Saved {len(rows)} fake PMT users to {filename}")


def print_summary(rows):
    scores = [r["overall_score"] for r in rows]
    levels = [r["overall_level"] for r in rows]
    print("\n=== Summary across", len(rows), "fake PMT users ===")
    print(f"Average overall score: {sum(scores) / len(scores):.2f}")
    print(f"Lowest score:  {min(scores)}")
    print(f"Highest score: {max(scores)}")
    print("\nHow many fell in each level:")
    for level in ["Low", "Medium", "High"]:
        c = levels.count(level)
        print(f"  {level}: {c} users ({c / len(levels) * 100:.1f}%)")
    print("\nMost common weakest area across all users:")
    counts = {}
    for r in rows:
        counts[r["weakest_area"]] = counts.get(r["weakest_area"], 0) + 1
    for area, c in sorted(counts.items(), key=lambda x: -x[1]):
        print(f"  {area}: {c} users")
    if "sebis_overall_score" in rows[0]:
        xs = [r["sebis_overall_score"] for r in rows]
        ys = scores
        mx, my = sum(xs) / len(xs), sum(ys) / len(ys)
        cov = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
        r_ = cov / (sum((x - mx) ** 2 for x in xs) * sum((y - my) ** 2 for y in ys)) ** 0.5
        print(f"\nCorrelation between SeBIS overall and PMT overall: {r_:.2f}")


if __name__ == "__main__":
    rows = generate_fake_dataset(NUM_FAKE_USERS)
    save_to_csv(rows)
    print_summary(rows)
