"""
CyberShield - TTAT Scoring Module (Technology Threat Avoidance Theory)

35 statements supplied by the supervisor (6 constructs). Each answer is on a
7-point scale (assumed, to match the PMT and TPB scales):
  1 = Strongly disagree ... 4 = Neutral ... 7 = Strongly agree

Constructs:
  perceived_susceptibility  (6 items)
  perceived_severity        (5 items)  - SEV2 is reverse-worded
  perceived_threat          (7 items)
  response_effectiveness    (5 items)
  self_efficacy             (5 items)
  response_cost             (7 items)  - all 7 are reverse-scored (see below)

Reverse scoring (flip = 8 - answer) is done BEFORE averaging so that a HIGH
final score ALWAYS means a stronger, more supportive factor - the same
convention as sebis_scoring.py, pmt_scoring.py and tpb_scoring.py:
  * SEV2 is reverse-worded in the questionnaire itself.
  * response_cost items are all costs (time, effort, inconvenience...). They
    are flipped so that HIGH = the person sees security software as cheap
    and easy, LOW = they see it as costly. This is the same convention that
    pmt_scoring.py uses for its response_cost.

Each construct score is the mean of its items. The overall TTAT score is the
mean of the 6 constructs. (The supervisor's list has no avoidance-motivation
or behavior items, so those are not scored.)

The Low / Medium / High cutoffs (3.25 / 4.75) are the same as PMT and TPB
because it is the same 1-7 scale. They are a team design choice, not part of
the source.
"""

SCALE_MIN = 1
SCALE_MAX = 7

TTAT_ITEMS = [
    # --- Perceived Susceptibility (6 items) ---
    {"id": "SUS1", "construct": "perceived_susceptibility", "reverse": False,
     "text": "I could be subjected to a computer security breach."},
    {"id": "SUS2", "construct": "perceived_susceptibility", "reverse": False,
     "text": "I am vulnerable to a computer security breach."},
    {"id": "SUS3", "construct": "perceived_susceptibility", "reverse": False,
     "text": "There is a good possibility that I will experience a computer security breach."},
    {"id": "SUS4", "construct": "perceived_susceptibility", "reverse": False,
     "text": "It is likely that I could be the target of a computer security breach."},
    {"id": "SUS5", "construct": "perceived_susceptibility", "reverse": False,
     "text": "My computer is at risk for becoming the target of a computer security breach."},
    {"id": "SUS6", "construct": "perceived_susceptibility", "reverse": False,
     "text": "I could be vulnerable to a computer security breach on my personal computing devices."},

    # --- Perceived Severity (5 items) ---
    {"id": "SEV1", "construct": "perceived_severity", "reverse": False,
     "text": "Experiencing a computer security breach would be a serious problem for me."},
    {"id": "SEV2", "construct": "perceived_severity", "reverse": True,
     "text": "Loss due to a computer security breach is not a serious problem for me."},
    {"id": "SEV3", "construct": "perceived_severity", "reverse": False,
     "text": "A computer security breach could allow someone to steal information from my personal computing device without my knowledge."},
    {"id": "SEV4", "construct": "perceived_severity", "reverse": False,
     "text": "Being a victim of a security breach would be a serious problem for me."},
    {"id": "SEV5", "construct": "perceived_severity", "reverse": False,
     "text": "If my personal computing device were the target of a computer security breach, the consequences would be great."},

    # --- Perceived Threat (7 items) ---
    {"id": "THR1", "construct": "perceived_threat", "reverse": False,
     "text": "A computer security breach could invade my privacy."},
    {"id": "THR2", "construct": "perceived_threat", "reverse": False,
     "text": "Information on my personal computing device could be collected if I experienced a computer security breach."},
    {"id": "THR3", "construct": "perceived_threat", "reverse": False,
     "text": "A computer security breach poses a threat to me."},
    {"id": "THR4", "construct": "perceived_threat", "reverse": False,
     "text": "The consequences of experiencing a computer security breach on my personal computing device threaten me."},
    {"id": "THR5", "construct": "perceived_threat", "reverse": False,
     "text": "A computer security breach is a danger to my personal computing device."},
    {"id": "THR6", "construct": "perceived_threat", "reverse": False,
     "text": "It is risky to use my computer since it could be a target of a computer security breach."},
    {"id": "THR7", "construct": "perceived_threat", "reverse": False,
     "text": "I am concerned for the security of the data on my personal computing devices."},

    # --- Response Effectiveness (5 items) ---
    {"id": "EFF1", "construct": "response_effectiveness", "reverse": False,
     "text": "Software that prevents computer security breaches would help me protect my personal computing device."},
    {"id": "EFF2", "construct": "response_effectiveness", "reverse": False,
     "text": "Software that prevents computer security breaches would enhance my effectiveness in preventing computer security breaches on my personal computing device."},
    {"id": "EFF3", "construct": "response_effectiveness", "reverse": False,
     "text": "Software that prevents computer security breaches would make it easier to safeguard my personal computing device."},
    {"id": "EFF4", "construct": "response_effectiveness", "reverse": False,
     "text": "Software that prevents computer security breaches would be useful in protecting my personal computing device."},
    {"id": "EFF5", "construct": "response_effectiveness", "reverse": False,
     "text": "Software that prevents computer security breaches would prevent hackers from accessing important information."},

    # --- Self-Efficacy (5 items) ---
    {"id": "SE1", "construct": "self_efficacy", "reverse": False,
     "text": "I can use software that prevents security breaches because it is easy to install."},
    {"id": "SE2", "construct": "self_efficacy", "reverse": False,
     "text": "I can use software that prevents security breaches because it does not require too much training."},
    {"id": "SE3", "construct": "self_efficacy", "reverse": False,
     "text": "I can use software that prevents security breaches because I can install it without too much effort."},
    {"id": "SE4", "construct": "self_efficacy", "reverse": False,
     "text": "I can use software that prevents security breaches because I know how to get it."},
    {"id": "SE5", "construct": "self_efficacy", "reverse": False,
     "text": "I can use software that prevents security breaches even if there is no one around to help me install it."},

    # --- Response Cost (7 items) - all are costs, so all are reverse-scored ---
    {"id": "COST1", "construct": "response_cost", "reverse": True,
     "text": "Enabling software that prevents computer security breaches on my personal computing device would be time-consuming."},
    {"id": "COST2", "construct": "response_cost", "reverse": True,
     "text": "Enabling software that prevents computer security breaches on my personal computing device may cause issues with other programs."},
    {"id": "COST3", "construct": "response_cost", "reverse": True,
     "text": "Enabling software that prevents computer security breaches on my personal computing device would involve too many overhead costs."},
    {"id": "COST4", "construct": "response_cost", "reverse": True,
     "text": "Enabling software that prevents computer security breaches on my personal computing device would require considerable investment of effort other than time."},
    {"id": "COST5", "construct": "response_cost", "reverse": True,
     "text": "Enabling software that prevents computer security breaches on my personal computing device would be inconvenient."},
    {"id": "COST6", "construct": "response_cost", "reverse": True,
     "text": "Enabling software that prevents computer security breaches on my personal computing device would be costly."},
    {"id": "COST7", "construct": "response_cost", "reverse": True,
     "text": "Enabling software that prevents computer security breaches on my personal computing device would change the way I use the computer."},
]

CONSTRUCTS = [
    "perceived_susceptibility",
    "perceived_severity",
    "perceived_threat",
    "response_effectiveness",
    "self_efficacy",
    "response_cost",
]
PREDICTOR_CONSTRUCTS = CONSTRUCTS  # all six are scored and averaged


def score_item(item, raw_answer):
    """Flip the answer if the item is reverse-scored. raw_answer is 1-7."""
    if item["reverse"]:
        return (SCALE_MIN + SCALE_MAX) - raw_answer  # 8 - answer
    return raw_answer


def calculate_construct_scores(answers):
    """answers: {"SUS1": 6, "SEV2": 2, ...} - one raw answer (1-7) per item id."""
    totals = {c: [] for c in CONSTRUCTS}
    for item in TTAT_ITEMS:
        item_id = item["id"]
        if item_id not in answers:
            raise ValueError(f"Missing answer for item {item_id}")
        raw = answers[item_id]
        if not isinstance(raw, int) or raw < SCALE_MIN or raw > SCALE_MAX:
            raise ValueError(f"Answer for {item_id} must be an integer from 1 to 7")
        totals[item["construct"]].append(score_item(item, raw))
    return {c: round(sum(v) / len(v), 2) for c, v in totals.items()}


def calculate_overall_score(construct_scores):
    """Overall TTAT score = average of the 6 constructs."""
    values = [construct_scores[c] for c in PREDICTOR_CONSTRUCTS]
    return round(sum(values) / len(values), 2)


def classify_level(score, low_cutoff=3.25, high_cutoff=4.75):
    """Low / Medium / High. Same cutoffs as PMT and TPB (same 1-7 scale)."""
    if score < low_cutoff:
        return "Low"
    elif score < high_cutoff:
        return "Medium"
    return "High"


def build_profile(answers):
    """Runs the full TTAT scoring pipeline and returns a ready-to-use profile."""
    construct_scores = calculate_construct_scores(answers)
    overall_score = calculate_overall_score(construct_scores)
    return {
        "construct_scores": construct_scores,
        "construct_levels": {c: classify_level(v) for c, v in construct_scores.items()},
        "overall_score": overall_score,
        "overall_level": classify_level(overall_score),
        "weakest_area": min(PREDICTOR_CONSTRUCTS, key=lambda c: construct_scores[c]),
    }
