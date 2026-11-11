"""
CyberShield - Generate 500 Fake Users for Testing

This script creates 500 fake respondents with VARIED answer patterns
(not pure random - some careless, some careful, most in between, like
real people), runs them through the real scoring engine
(sebis_scoring.py), and saves everything to one CSV file.

It also prints a summary so the team can check whether the Low/Medium/
High cutoffs make sense across a large group.

Requires sebis_scoring.py to be in the same folder.
"""

import csv
import random

from sebis_scoring import SEBIS_ITEMS, build_profile

NUM_FAKE_USERS = 500


def generate_one_fake_user(carefulness):
    """
    carefulness: a number from 0.0 (very careless) to 1.0 (very careful).
    Generates 16 answers biased toward that carefulness level, with
    some random noise so it doesn't look robotic.
    """
    answers = {}
    for item in SEBIS_ITEMS:
        # Base answer leans toward carefulness (1-5 scale)
        base = 1 + carefulness * 4
        noise = random.uniform(-1.2, 1.2)
        raw_behavior_answer = base + noise
        raw_behavior_answer = max(1, min(5, round(raw_behavior_answer)))

        # If the question is reverse-worded, a "careful" person should
        # give a LOW raw answer (since agreeing with it means bad
        # behavior) - so we flip the direction before saving it.
        if item["reverse"]:
            answers[item["id"]] = 6 - raw_behavior_answer
        else:
            answers[item["id"]] = raw_behavior_answer
    return answers


def generate_fake_dataset(n=NUM_FAKE_USERS):
    rows = []
    for i in range(1, n + 1):
        user_id = f"fake_user_{i}"
        # Spread carefulness across the whole population (some very
        # careless, some very careful, most in between).
        carefulness = random.betavariate(2, 2)  # bell-shaped, 0 to 1

        answers = generate_one_fake_user(carefulness)
        profile = build_profile(answers)

        row = {"user_id": user_id}
        row.update(answers)
        row["device_securement_score"] = profile["subscale_scores"]["device_securement"]
        row["password_generation_score"] = profile["subscale_scores"]["password_generation"]
        row["proactive_awareness_score"] = profile["subscale_scores"]["proactive_awareness"]
        row["updating_score"] = profile["subscale_scores"]["updating"]
        row["overall_score"] = profile["overall_score"]
        row["overall_level"] = profile["overall_level"]
        row["weakest_area"] = profile["weakest_area"]
        rows.append(row)
    return rows


def save_to_csv(rows, filename="fake_users_500.csv"):
    fieldnames = list(rows[0].keys())
    with open(filename, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    print(f"Saved {len(rows)} fake users to {filename}")


def print_summary(rows):
    overall_scores = [r["overall_score"] for r in rows]
    levels = [r["overall_level"] for r in rows]

    print("\n=== Summary across", len(rows), "fake users ===")
    print(f"Average overall score: {sum(overall_scores) / len(overall_scores):.2f}")
    print(f"Lowest score:  {min(overall_scores)}")
    print(f"Highest score: {max(overall_scores)}")

    print("\nHow many fell in each level:")
    for level in ["Low", "Medium", "High"]:
        count = levels.count(level)
        pct = (count / len(levels)) * 100
        print(f"  {level}: {count} users ({pct:.1f}%)")

    print("\nMost common weakest area across all users:")
    weakest_counts = {}
    for r in rows:
        w = r["weakest_area"]
        weakest_counts[w] = weakest_counts.get(w, 0) + 1
    for area, count in sorted(weakest_counts.items(), key=lambda x: -x[1]):
        print(f"  {area}: {count} users")


if __name__ == "__main__":
    rows = generate_fake_dataset(NUM_FAKE_USERS)
    save_to_csv(rows)
    print_summary(rows)