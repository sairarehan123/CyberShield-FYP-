"""
CyberShield - SeBIS Scoring Module
Based on: Egelman & Peer, "Scaling the Security Wall" (CHI 2015)

Each answer is on a 5-point scale:
  1 = Never, 2 = Rarely, 3 = Sometimes, 4 = Often, 5 = Always

Some items are worded negatively ("reverse" = True). Their answers
must be flipped (6 - answer) before averaging, so that a HIGH final
score always means BETTER security behavior.
"""

# The 16 validated SeBIS items, grouped by subscale.
SEBIS_ITEMS = [
    # --- Device Securement (4 items) ---
    {"id": "F3",  "subscale": "device_securement", "reverse": False,
     "text": "I manually lock my computer screen when I step away from it."},
    {"id": "F4",  "subscale": "device_securement", "reverse": False,
     "text": "I set my computer screen to automatically lock if I don't use it for a prolonged period of time."},
    {"id": "F5",  "subscale": "device_securement", "reverse": False,
     "text": "I use a PIN or passcode to unlock my mobile phone."},
    {"id": "F6",  "subscale": "device_securement", "reverse": False,
     "text": "I use a password/passcode to unlock my laptop or tablet."},

    # --- Password Generation (4 items) ---
    {"id": "F12", "subscale": "password_generation", "reverse": True,
     "text": "I do not change my passwords, unless I have to."},
    {"id": "F13", "subscale": "password_generation", "reverse": False,
     "text": "I use different passwords for different accounts that I have."},
    {"id": "F14", "subscale": "password_generation", "reverse": True,
     "text": "I do not include special characters in my password if it's not required."},
    {"id": "F15", "subscale": "password_generation", "reverse": False,
     "text": "When I create a new online account, I try to use a password that goes beyond the site's minimum requirements."},

    # --- Proactive Awareness (5 items) ---
    {"id": "F7",  "subscale": "proactive_awareness", "reverse": True,
     "text": "If I discover a security problem, I continue what I was doing because I assume someone else will fix it."},
    {"id": "F8",  "subscale": "proactive_awareness", "reverse": True,
     "text": "When someone sends me a link, I open it without first verifying where it goes."},
    {"id": "F10", "subscale": "proactive_awareness", "reverse": False,
     "text": "When browsing websites, I mouseover links to see where they go, before clicking them."},
    {"id": "F11", "subscale": "proactive_awareness", "reverse": True,
     "text": "I know what website I'm visiting based on its look and feel, rather than by looking at the URL bar."},
    {"id": "F16", "subscale": "proactive_awareness", "reverse": True,
     "text": "I submit information to websites without first verifying that it will be sent securely (e.g., SSL, \"https://\", a lock icon)."},

    # --- Updating (3 items) ---
    {"id": "F1",  "subscale": "updating", "reverse": False,
     "text": "When I'm prompted about a software update, I install it right away."},
    {"id": "F2",  "subscale": "updating", "reverse": False,
     "text": "I try to make sure that the programs I use are up-to-date."},
    {"id": "F9",  "subscale": "updating", "reverse": False,
     "text": "I verify that my anti-virus software has been regularly updating itself."},
]

SUBSCALES = ["device_securement", "password_generation", "proactive_awareness", "updating"]


def score_item(item, raw_answer):
    """Flip the answer if the item is reverse-worded. raw_answer is 1-5."""
    if item["reverse"]:
        return 6 - raw_answer
    return raw_answer


def calculate_subscale_scores(answers):
    """
    answers: a dict like {"F1": 4, "F2": 5, "F3": 2, ...} — one entry
             per item id above, each a raw answer from 1 to 5.

    Returns a dict like:
        {"device_securement": 3.25, "password_generation": 4.0,
         "proactive_awareness": 2.8, "updating": 3.67}
    """
    subscale_totals = {s: [] for s in SUBSCALES}

    for item in SEBIS_ITEMS:
        item_id = item["id"]
        if item_id not in answers:
            raise ValueError(f"Missing answer for item {item_id}")
        scored = score_item(item, answers[item_id])
        subscale_totals[item["subscale"]].append(scored)

    subscale_scores = {}
    for subscale, values in subscale_totals.items():
        subscale_scores[subscale] = round(sum(values) / len(values), 2)

    return subscale_scores


def calculate_overall_score(subscale_scores):
    """Overall SeBIS score = average of the 4 subscale scores."""
    return round(sum(subscale_scores.values()) / len(subscale_scores), 2)


def classify_level(score, low_cutoff=2.5, high_cutoff=3.5):
    """Turns a numeric score into Low / Medium / High. Cutoffs are a
    team design choice, not part of the original SeBIS paper -
    adjust these once real data is available."""
    if score < low_cutoff:
        return "Low"
    elif score < high_cutoff:
        return "Medium"
    else:
        return "High"


def build_profile(answers):
    """Runs the full scoring pipeline and returns a ready-to-use profile."""
    subscale_scores = calculate_subscale_scores(answers)
    overall_score = calculate_overall_score(subscale_scores)

    subscale_levels = {s: classify_level(v) for s, v in subscale_scores.items()}
    weakest_subscale = min(subscale_scores, key=subscale_scores.get)

    return {
        "subscale_scores": subscale_scores,
        "subscale_levels": subscale_levels,
        "overall_score": overall_score,
        "overall_level": classify_level(overall_score),
        "weakest_area": weakest_subscale,
    }


# ---------------------------------------------------------------------
# Quick test - run this file directly to see it work on a fake profile.
# ---------------------------------------------------------------------
if __name__ == "__main__":
    # A fake user: careless about passwords, careful about updates.
    fake_answers = {
        "F1": 5, "F2": 4, "F9": 4,               # Updating - high
        "F3": 3, "F4": 4, "F5": 3, "F6": 4,       # Device Securement - medium
        "F7": 4, "F8": 4, "F10": 3, "F11": 3, "F16": 4,  # Proactive Awareness - medium/high
        "F12": 5, "F13": 1, "F14": 5, "F15": 1,   # Password Generation - low (careless)
        # F12 and F14 are reverse-worded, so a raw 5 here means "always
        # careless" -> flips to a low score after reversing.
    }

    profile = build_profile(fake_answers)

    print("Subscale scores:", profile["subscale_scores"])
    print("Subscale levels:", profile["subscale_levels"])
    print("Overall score:  ", profile["overall_score"])
    print("Overall level:  ", profile["overall_level"])
    print("Weakest area:   ", profile["weakest_area"])