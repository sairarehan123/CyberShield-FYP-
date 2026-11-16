"""
CyberShield - PMT Scoring Module (Protection Motivation Theory)
Items from: Kiran et al., "Explanatory and predictive modeling of
cybersecurity behaviors using protection motivation theory",
Computers & Security 149 (2025) 104204, Appendix 1
(items originally adapted from Thompson et al., 2017).

Each answer is on a 7-point Likert scale:
  1 = Strongly disagree ... 4 = Neutral ... 7 = Strongly agree

Constructs (30 items):
  Threat appraisal : perceived_severity (6), perceived_vulnerability (6)
  Coping appraisal : response_efficacy (4), self_efficacy (5),
                     response_cost (6)
  Outcome          : security_intention (3)

Response cost is the only "inverse" construct: in the paper, a HIGH raw
response-cost score means a LOW coping appraisal. So its items are marked
reverse = True and flipped (8 - answer) before averaging. After that,
a HIGH final score ALWAYS means a stronger protection motivation, the
same convention as sebis_scoring.py.
"""

SCALE_MIN = 1
SCALE_MAX = 7

PMT_ITEMS = [
    # --- Perceived Severity (6 items) ---
    {"id": "PS1", "construct": "perceived_severity", "reverse": False,
     "text": "A security breach on my device would be a serious problem for me."},
    {"id": "PS2", "construct": "perceived_severity", "reverse": False,
     "text": "A loss of information resulting from hacking would be a serious problem for me."},
    {"id": "PS3", "construct": "perceived_severity", "reverse": False,
     "text": "Having my confidential information on my device accessed by someone without my consent or knowledge would be a serious problem for me."},
    {"id": "PS4", "construct": "perceived_severity", "reverse": False,
     "text": "Having someone successfully attack and damage my device would be very problematic for me."},
    {"id": "PS5", "construct": "perceived_severity", "reverse": False,
     "text": "I view information security attacks on me as harmful."},
    {"id": "PS6", "construct": "perceived_severity", "reverse": False,
     "text": "I believe that protecting the information on my device is important."},

    # --- Perceived Vulnerability (6 items) ---
    {"id": "PV1", "construct": "perceived_vulnerability", "reverse": False,
     "text": "I could be subject to a serious information security threat."},
    {"id": "PV2", "construct": "perceived_vulnerability", "reverse": False,
     "text": "I am facing more and more information security threats."},
    {"id": "PV3", "construct": "perceived_vulnerability", "reverse": False,
     "text": "I feel that my device could be vulnerable to a security threat."},
    {"id": "PV4", "construct": "perceived_vulnerability", "reverse": False,
     "text": "It is likely that my device will be compromised in the future."},
    {"id": "PV5", "construct": "perceived_vulnerability", "reverse": False,
     "text": "My information and data is vulnerable to security breaches."},
    {"id": "PV6", "construct": "perceived_vulnerability", "reverse": False,
     "text": "I could fall victim to a malicious attack if I fail to follow good security practices."},

    # --- Response Cost (6 items) - INVERSE construct, flipped when scored ---
    {"id": "RC1", "construct": "response_cost", "reverse": True,
     "text": "Taking security measures inconveniences me."},
    {"id": "RC2", "construct": "response_cost", "reverse": True,
     "text": "There are too many overheads associated with taking security measures to protect my device."},
    {"id": "RC3", "construct": "response_cost", "reverse": True,
     "text": "Taking security measures would require considerable investment of effort."},
    {"id": "RC4", "construct": "response_cost", "reverse": True,
     "text": "Implementing security measures on my device would be time consuming."},
    {"id": "RC5", "construct": "response_cost", "reverse": True,
     "text": "The cost of implementing recommended security measures exceeds the benefits."},
    {"id": "RC6", "construct": "response_cost", "reverse": True,
     "text": "The impact of security measures on my productivity exceeds the benefits."},

    # --- Response Efficacy (4 items) ---
    {"id": "RE1", "construct": "response_efficacy", "reverse": False,
     "text": "Enabling security measures on my device will prevent security breaches."},
    {"id": "RE2", "construct": "response_efficacy", "reverse": False,
     "text": "Implementing security measures on my device is an effective way to prevent hackers."},
    {"id": "RE3", "construct": "response_efficacy", "reverse": False,
     "text": "Enabling security measures on my device will prevent hackers from stealing my identity."},
    {"id": "RE4", "construct": "response_efficacy", "reverse": False,
     "text": "The preventative measures available to stop people from getting confidential personal or financial information on my device are effective."},

    # --- Self-Efficacy (5 items) ---
    {"id": "SE1", "construct": "self_efficacy", "reverse": False,
     "text": "I feel comfortable taking measures to secure my device."},
    {"id": "SE2", "construct": "self_efficacy", "reverse": False,
     "text": "Taking the necessary security measures is directly under my control."},
    {"id": "SE3", "construct": "self_efficacy", "reverse": False,
     "text": "I have the resources and the knowledge to take the necessary security measures."},
    {"id": "SE4", "construct": "self_efficacy", "reverse": False,
     "text": "Taking the necessary security measures is easy."},
    {"id": "SE5", "construct": "self_efficacy", "reverse": False,
     "text": "I can protect my device by myself, I can enable security measures on my device."},

    # --- Security Intention (3 items) - the motivation / outcome ---
    {"id": "SI1", "construct": "security_intention", "reverse": False,
     "text": "I am likely to take security measures on my devices (smartphone, computer/laptop)."},
    {"id": "SI2", "construct": "security_intention", "reverse": False,
     "text": "I will take security measures to protect my devices (smartphone, computer/laptop)."},
    {"id": "SI3", "construct": "security_intention", "reverse": False,
     "text": "It is my intention to take measures to protect my devices (smartphone, computer/laptop)."},
]

# All constructs that get their own score/level.
CONSTRUCTS = [
    "perceived_severity",
    "perceived_vulnerability",
    "response_cost",
    "response_efficacy",
    "self_efficacy",
    "security_intention",
]

# The five PMT predictors. The overall PMT score averages these only -
# security_intention is the outcome they are meant to explain, so it is
# reported separately and not averaged into the overall score.
PREDICTOR_CONSTRUCTS = [
    "perceived_severity",
    "perceived_vulnerability",
    "response_cost",
    "response_efficacy",
    "self_efficacy",
]

THREAT_APPRAISAL = ["perceived_severity", "perceived_vulnerability"]
COPING_APPRAISAL = ["response_efficacy", "self_efficacy", "response_cost"]


def score_item(item, raw_answer):
    """Flip the answer if the item is reverse-scored. raw_answer is 1-7."""
    if item["reverse"]:
        return (SCALE_MIN + SCALE_MAX) - raw_answer  # 8 - answer
    return raw_answer


def calculate_construct_scores(answers):
    """
    answers: a dict like {"PS1": 6, "PV1": 4, "RC1": 2, ...} - one entry
             per item id above, each a raw answer from 1 to 7.
    """
    totals = {c: [] for c in CONSTRUCTS}

    for item in PMT_ITEMS:
        item_id = item["id"]
        if item_id not in answers:
            raise ValueError(f"Missing answer for item {item_id}")
        raw = answers[item_id]
        if not isinstance(raw, int) or raw < SCALE_MIN or raw > SCALE_MAX:
            raise ValueError(f"Answer for {item_id} must be an integer from 1 to 7")
        totals[item["construct"]].append(score_item(item, raw))

    return {c: round(sum(v) / len(v), 2) for c, v in totals.items()}


def calculate_overall_score(construct_scores):
    """Overall PMT score = average of the 5 PMT predictor constructs."""
    values = [construct_scores[c] for c in PREDICTOR_CONSTRUCTS]
    return round(sum(values) / len(values), 2)


def classify_level(score, low_cutoff=3.25, high_cutoff=4.75):
    """Turns a numeric score into Low / Medium / High. The cutoffs sit at the
    same relative position on the 1-7 scale as the SeBIS cutoffs (2.5 / 3.5)
    do on the 1-5 scale. They are a team design choice, not part of the
    paper - adjust once real data is available."""
    if score < low_cutoff:
        return "Low"
    elif score < high_cutoff:
        return "Medium"
    else:
        return "High"


def build_profile(answers):
    """Runs the full PMT scoring pipeline and returns a ready-to-use profile."""
    construct_scores = calculate_construct_scores(answers)
    overall_score = calculate_overall_score(construct_scores)

    construct_levels = {c: classify_level(v) for c, v in construct_scores.items()}

    # Weakest area is picked from the PMT predictors only.
    weakest_construct = min(PREDICTOR_CONSTRUCTS, key=lambda c: construct_scores[c])

    def group_average(names):
        return round(sum(construct_scores[c] for c in names) / len(names), 2)

    return {
        "construct_scores": construct_scores,
        "construct_levels": construct_levels,
        "threat_appraisal_score": group_average(THREAT_APPRAISAL),
        "coping_appraisal_score": group_average(COPING_APPRAISAL),
        "overall_score": overall_score,
        "overall_level": classify_level(overall_score),
        "weakest_area": weakest_construct,
    }
