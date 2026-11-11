"""
CyberShield - User profiling (SeBIS + every completed theory)

Combines a user's latest SeBIS result with the latest result of EVERY theory
that has been completed (PMT and TPB now; TTAT later) into ONE profile, and
prepares the "training brief" that the AI training step will read.

How it stays flexible
---------------------
Every theory is described by ONE entry in THEORIES below:
    its saved-results module, its SeBIS-area mapping (theory_linking.py), what
    a low score on each construct means, and its answer scale.
This module never mentions a specific theory anywhere else. To add TTAT:
    1. write ttat_scoring.py / ttat_assessment.py (same shape as tpb_*.py),
    2. add SEBIS_TO_TTAT + meanings in theory_linking.py,
    3. add ONE entry to THEORIES.
Nothing else here changes. A theory the user has not done yet is skipped, so
the profile never fails because something is missing.

Scores from theories on different scales are compared after being converted
to 0-1 (normalized), so a 1-7 score and a 1-5 score can sit side by side.

!! The SeBIS-to-theory mappings are the team's DRAFT design !!
"""

import theory_linking
import pmt_assessment
import tpb_assessment
from sebis_assessment import get_latest_result as get_latest_sebis

THEORIES = [
    {
        "key": "pmt",
        "label": "Protection Motivation Theory",
        "assessment": pmt_assessment,
        "mapping": theory_linking.SEBIS_TO_PMT,
        "meanings": theory_linking.LOW_SCORE_MEANING,
        "scale": (1, 7),
    },
    {
        "key": "tpb",
        "label": "Theory of Planned Behavior",
        "assessment": tpb_assessment,
        "mapping": theory_linking.SEBIS_TO_TPB,
        "meanings": theory_linking.TPB_LOW_SCORE_MEANING,
        "scale": (1, 7),
    },
]

MAPPING_STATUS = "draft_pending_supervisor_approval"
MAX_REASONS_PER_AREA = 2  # at most this many weak reasons are passed on per area


def _normalize(score, scale):
    lo, hi = scale
    return round((score - lo) / (hi - lo), 3)


def _load_theory_results(user_id):
    """{theory_key: saved record} for every theory this user has completed."""
    found = {}
    for t in THEORIES:
        record = t["assessment"].get_latest_result(user_id)
        if record is not None:
            found[t["key"]] = record
    return found


def build_profile_from_records(user_id, sebis_record, theory_records):
    """
    Pure function (no file access): builds the unified profile from a SeBIS
    record and a dict of theory records. build_user_profile() calls this.
    """
    sebis = sebis_record["profile"]
    done = [t for t in THEORIES if t["key"] in theory_records]

    areas = {}
    for area, score in sebis["subscale_scores"].items():
        level = sebis["subscale_levels"][area]
        drivers = []
        for t in done:
            profile = theory_records[t["key"]]["profile"]
            for link in t["mapping"].get(area, []):
                c = link["construct"]
                if c not in profile["construct_scores"]:
                    continue  # mapping mentions something this version does not score: skip, never fail
                s = profile["construct_scores"][c]
                drivers.append({
                    "theory": t["key"],
                    "construct": c,
                    "score": s,
                    "level": profile["construct_levels"][c],
                    "normalized": _normalize(s, t["scale"]),
                    "why": link["why"],
                    "meaning_if_low": t["meanings"].get(c, ""),
                })
        # Most worrying first: lowest normalized score; ties keep mapping order (stable sort).
        drivers.sort(key=lambda d: d["normalized"])
        weak = [d for d in drivers if d["level"] != "High"]

        needs_training = level != "High"
        reasons = weak[:MAX_REASONS_PER_AREA] if needs_training else []
        areas[area] = {
            "sebis_score": score,
            "sebis_level": level,
            "needs_training": needs_training,
            "likely_barrier": reasons[0] if reasons else None,
            "reasons": reasons,
            "drivers": drivers,
        }

    # Training brief: weak areas, weakest first. This is what the AI training reads.
    brief = []
    for area, info in sorted(areas.items(), key=lambda kv: kv[1]["sebis_score"]):
        if not info["needs_training"]:
            continue
        brief.append({
            "area": area,
            "sebis_score": info["sebis_score"],
            "sebis_level": info["sebis_level"],
            "reasons": [
                {"theory": r["theory"], "construct": r["construct"],
                 "score": r["score"], "level": r["level"],
                 "meaning": r["meaning_if_low"]}
                for r in info["reasons"]
            ],
            "reason_known": bool(info["reasons"]),
        })

    return {
        "user_id": user_id,
        "mapping_status": MAPPING_STATUS,
        "theories_completed": [t["key"] for t in done],
        "theories_missing": [t["key"] for t in THEORIES if t["key"] not in theory_records],
        "sebis": {
            "overall_score": sebis["overall_score"],
            "overall_level": sebis["overall_level"],
            "subscale_scores": sebis["subscale_scores"],
            "subscale_levels": sebis["subscale_levels"],
            "weakest_area": sebis["weakest_area"],
        },
        "theories": {
            key: {
                "overall_score": rec["profile"].get("overall_score"),
                "overall_level": rec["profile"].get("overall_level"),
                "construct_scores": rec["profile"]["construct_scores"],
                "construct_levels": rec["profile"]["construct_levels"],
                "weakest_area": rec["profile"].get("weakest_area"),
            }
            for key, rec in theory_records.items()
        },
        "areas": areas,
        "training_brief": brief,
    }


def build_user_profile(user_id):
    """Loads the user's saved results and builds the profile. None if no SeBIS yet."""
    sebis_record = get_latest_sebis(user_id)
    if sebis_record is None:
        return None
    return build_profile_from_records(user_id, sebis_record, _load_theory_results(user_id))


def print_user_profile(profile):
    """CLI view of the unified profile."""
    print(f"\n=== User profile: {profile['user_id']} ===")
    s = profile["sebis"]
    print(f"SeBIS overall: {s['overall_score']} ({s['overall_level']})")
    print("Theories completed:", ", ".join(profile["theories_completed"]) or "none")
    if profile["theories_missing"]:
        print("Not done yet:      ", ", ".join(profile["theories_missing"]))
    for area, info in profile["areas"].items():
        print(f"\n  {area}: {info['sebis_score']} ({info['sebis_level']})")
        if not info["needs_training"]:
            print("      strong - no training needed")
        elif info["reasons"]:
            for r in info["reasons"]:
                print(f"      likely reason: [{r['theory'].upper()}] {r['construct']} "
                      f"{r['score']} ({r['level']}) - {r['meaning_if_low']}")
        else:
            print("      needs training; no weak motivation factor found (more likely habit)")
    print("\n  (Mappings are a DRAFT.)")
