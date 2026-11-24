"""
CyberShield - TPB Scoring Module (Theory of Planned Behavior)

14 statements supplied by the supervisor (3 constructs). Each answer is on a
7-point scale (assumed, to match the PMT scale and the TPB manual of Francis
et al., 2004):
  1 = Strongly disagree ... 4 = Neutral ... 7 = Strongly agree

Constructs:
  attitude                      (4 items)
  subjective_norm               (5 items)  - SN5 is reverse-worded
  perceived_behavioral_control  (5 items)  - PBC4 is reverse-worded

Reverse-worded items are flipped (8 - answer) before averaging, so a HIGH
final score ALWAYS means a stronger, more supportive TPB factor - the same
convention as sebis_scoring.py and pmt_scoring.py.

Each construct score is the mean of its items. The overall TPB score is the
mean of the 3 constructs. (The supervisor's list has no intention items, so
intention is not scored.)

The Low / Medium / High cutoffs (3.25 / 4.75) are the same as PMT because it
is the same 1-7 scale. They are a team design choice, not part of the source.
"""

SCALE_MIN = 1
SCALE_MAX = 7

TPB_ITEMS = [
    # --- Attitude (4 items) ---
    {"id": "ATT1", "construct": "attitude", "reverse": False,
     "text": "Performing/practicing cybersecurity behaviors is a good idea to protect my security online."},
    {"id": "ATT2", "construct": "attitude", "reverse": False,
     "text": "Performing/practicing cybersecurity behaviors is beneficial to keep my security online."},
    {"id": "ATT3", "construct": "attitude", "reverse": False,
     "text": "Performing/practicing cybersecurity behaviors is pleasant (for me)."},
    {"id": "ATT4", "construct": "attitude", "reverse": False,
     "text": "Performing/practicing cybersecurity behaviors is useful to keep my security online."},

    # --- Subjective Norm (5 items) ---
    {"id": "SN1", "construct": "subjective_norm", "reverse": False,
     "text": "Most people who are important to me think I should perform cybersecurity behaviors to keep my security online."},
    {"id": "SN2", "construct": "subjective_norm", "reverse": False,
     "text": "Most people who are important to me think it would be a good idea to practice cybersecurity behaviors to keep my security online."},
    {"id": "SN3", "construct": "subjective_norm", "reverse": False,
     "text": "Most people who are important to me want me to perform cybersecurity behaviors to keep my security online."},
    {"id": "SN4", "construct": "subjective_norm", "reverse": False,
     "text": "It is expected of me to perform cybersecurity behaviors to keep my security online."},
    {"id": "SN5", "construct": "subjective_norm", "reverse": True,
     "text": "I don't feel under social pressure to perform cybersecurity behaviors."},

    # --- Perceived Behavioral Control (5 items) ---
    {"id": "PBC1", "construct": "perceived_behavioral_control", "reverse": False,
     "text": "I am confident that I could perform professionally recommended cybersecurity behavior."},
    {"id": "PBC2", "construct": "perceived_behavioral_control", "reverse": False,
     "text": "It is easy for me to perform professionally recommended cybersecurity behavior."},
    {"id": "PBC3", "construct": "perceived_behavioral_control", "reverse": False,
     "text": "I have the resources and the knowledge to perform (practice) professionally recommended cybersecurity behavior."},
    {"id": "PBC4", "construct": "perceived_behavioral_control", "reverse": True,
     "text": "The decision to perform professionally recommended cybersecurity behavior is beyond my control."},
    {"id": "PBC5", "construct": "perceived_behavioral_control", "reverse": False,
     "text": "Whether I perform professionally recommended cybersecurity behaviors or not is entirely up to me."},
]

CONSTRUCTS = ["attitude", "subjective_norm", "perceived_behavioral_control"]
PREDICTOR_CONSTRUCTS = CONSTRUCTS  # all three are scored and averaged


def score_item(item, raw_answer):
    """Flip the answer if the item is reverse-scored. raw_answer is 1-7."""
    if item["reverse"]:
        return (SCALE_MIN + SCALE_MAX) - raw_answer  # 8 - answer
    return raw_answer


def calculate_construct_scores(answers):
    """answers: {"ATT1": 6, "SN5": 2, ...} - one raw answer (1-7) per item id."""
    totals = {c: [] for c in CONSTRUCTS}
    for item in TPB_ITEMS:
        item_id = item["id"]
        if item_id not in answers:
            raise ValueError(f"Missing answer for item {item_id}")
        raw = answers[item_id]
        if not isinstance(raw, int) or raw < SCALE_MIN or raw > SCALE_MAX:
            raise ValueError(f"Answer for {item_id} must be an integer from 1 to 7")
        totals[item["construct"]].append(score_item(item, raw))
    return {c: round(sum(v) / len(v), 2) for c, v in totals.items()}


def calculate_overall_score(construct_scores):
    """Overall TPB score = average of the 3 constructs."""
    values = [construct_scores[c] for c in PREDICTOR_CONSTRUCTS]
    return round(sum(values) / len(values), 2)


def classify_level(score, low_cutoff=3.25, high_cutoff=4.75):
    """Low / Medium / High. Same cutoffs as PMT (same 1-7 scale)."""
    if score < low_cutoff:
        return "Low"
    elif score < high_cutoff:
        return "Medium"
    return "High"


def build_profile(answers):
    """Runs the full TPB scoring pipeline and returns a ready-to-use profile."""
    construct_scores = calculate_construct_scores(answers)
    overall_score = calculate_overall_score(construct_scores)
    return {
        "construct_scores": construct_scores,
        "construct_levels": {c: classify_level(v) for c, v in construct_scores.items()},
        "overall_score": overall_score,
        "overall_level": classify_level(overall_score),
        "weakest_area": min(PREDICTOR_CONSTRUCTS, key=lambda c: construct_scores[c]),
    }
