"""
CyberShield - Theory linking (SeBIS behavior <-> PMT motivation)

SeBIS measures what a person DOES (behavior, 4 areas).
PMT measures WHY they might not (motivation, 5 constructs + intention).

This module connects the two: for each SeBIS area it lists the PMT
constructs that most plausibly explain it, and - when the user has also
completed the PMT assessment - uses their own PMT scores to name the
most likely barrier.

!! DRAFT MAPPING - NOT YET APPROVED BY THE SUPERVISOR !!
SEBIS_TO_PMT below is a proposed mapping based on the PMT literature
(Kiran et al. 2025; Rogers 1975/1983; Thompson et al. 2017). It lives in
this ONE dictionary on purpose: once the supervisor approves or changes
it, edit it here and nothing else in the code needs to change.

NOTE on response_cost: pmt_scoring.py reverse-scores it, so for every
construct here a LOW score is the "problem" (for response_cost, low =
the person sees security measures as costly / inconvenient).
"""

FRAMEWORK = "PMT"
MAPPING_STATUS = "draft_pending_supervisor_approval"

# SeBIS area -> PMT constructs that may explain it (most relevant first).
SEBIS_TO_PMT = {
    "device_securement": [
        {"construct": "self_efficacy",
         "why": "Locking devices depends on feeling able to set it up and keep doing it."},
        {"construct": "response_cost",
         "why": "Locking screens and using passcodes adds small, repeated inconveniences."},
        {"construct": "response_efficacy",
         "why": "People lock devices when they believe it really prevents unwanted access."},
    ],
    "password_generation": [
        {"construct": "response_cost",
         "why": "Unique, strong passwords take effort to create and remember."},
        {"construct": "self_efficacy",
         "why": "Managing many strong passwords depends on feeling capable of doing it."},
        {"construct": "response_efficacy",
         "why": "Strong passwords are used when people believe they stop hackers."},
    ],
    "proactive_awareness": [
        {"construct": "perceived_vulnerability",
         "why": "Checking links and sites depends on feeling personally at risk."},
        {"construct": "perceived_severity",
         "why": "People stay alert when they see the consequences of an attack as serious."},
        {"construct": "response_efficacy",
         "why": "Verifying before clicking is only worth it if it is believed to work."},
    ],
    "updating": [
        {"construct": "response_efficacy",
         "why": "Updates are installed when people believe they prevent breaches."},
        {"construct": "response_cost",
         "why": "Update prompts interrupt work, so they feel costly."},
        {"construct": "perceived_vulnerability",
         "why": "Unpatched software matters more to people who feel exposed to threats."},
    ],
}

# What a LOW score on each construct means, written to follow "the most likely barrier is that ...".
LOW_SCORE_MEANING = {
    "perceived_severity": "you do not see security incidents as a serious problem",
    "perceived_vulnerability": "you do not feel personally at risk of an attack",
    "response_efficacy": "you doubt that security measures actually protect you",
    "self_efficacy": "you do not feel able to take the needed security steps",
    "response_cost": "you find security measures too costly, slow or inconvenient",
}


# ---------------------------------------------------------------------
# TPB (Theory of Planned Behavior) - same idea, same DRAFT status.
# For every TPB construct a LOW score is the "problem".
# ---------------------------------------------------------------------
SEBIS_TO_TPB = {
    "device_securement": [
        {"construct": "perceived_behavioral_control",
         "why": "Locking devices is kept up when it feels easy and under your control."},
        {"construct": "attitude",
         "why": "People lock devices when they see it as a good and useful habit."},
        {"construct": "subjective_norm",
         "why": "Habits like locking screens spread when the people around you expect them."},
    ],
    "password_generation": [
        {"construct": "perceived_behavioral_control",
         "why": "Managing many strong passwords needs confidence and the right resources."},
        {"construct": "attitude",
         "why": "Strong passwords are used when they are seen as worth the effort."},
        {"construct": "subjective_norm",
         "why": "People choose stronger passwords when those around them expect it."},
    ],
    "proactive_awareness": [
        {"construct": "attitude",
         "why": "Checking links and sites happens when it is seen as useful."},
        {"construct": "subjective_norm",
         "why": "People stay careful online when those around them do."},
        {"construct": "perceived_behavioral_control",
         "why": "Verifying links needs the knowledge to know what to look for."},
    ],
    "updating": [
        {"construct": "attitude",
         "why": "Updates are installed when they are seen as useful."},
        {"construct": "perceived_behavioral_control",
         "why": "Updating needs the time, knowledge and control to do it."},
        {"construct": "subjective_norm",
         "why": "People keep software current when those around them expect it."},
    ],
}

TPB_LOW_SCORE_MEANING = {
    "attitude": "you do not see cybersecurity behaviors as good, useful or worthwhile",
    "subjective_norm": "you do not feel that the people around you expect you to practice cybersecurity",
    "perceived_behavioral_control": "you do not feel confident or in control of practicing cybersecurity behaviors",
}


# ---------------------------------------------------------------------
# TTAT (Technology Threat Avoidance Theory) - same idea, same DRAFT status.
# For every TTAT construct a LOW score is the "problem".
# (response_cost is reverse-scored in ttat_scoring.py, so low = the person
# sees security software as costly / inconvenient.)
# ---------------------------------------------------------------------
SEBIS_TO_TTAT = {
    "device_securement": [
        {"construct": "self_efficacy",
         "why": "Locking devices is kept up when you feel able to set it up without help."},
        {"construct": "response_cost",
         "why": "Locking screens and using passcodes adds small, repeated inconveniences."},
        {"construct": "response_effectiveness",
         "why": "People lock devices when they believe protection really keeps intruders out."},
    ],
    "password_generation": [
        {"construct": "response_cost",
         "why": "Unique, strong passwords take effort and change how you use your accounts."},
        {"construct": "perceived_threat",
         "why": "People bother with strong passwords when a breach feels like a real danger to them."},
        {"construct": "self_efficacy",
         "why": "Managing many strong passwords depends on feeling able to do it alone."},
    ],
    "proactive_awareness": [
        {"construct": "perceived_susceptibility",
         "why": "Checking links and sites depends on feeling that you could be the target."},
        {"construct": "perceived_threat",
         "why": "People stay alert when breaches feel like a danger to their privacy and data."},
        {"construct": "perceived_severity",
         "why": "People stay careful when they see the consequences of a breach as serious."},
    ],
    "updating": [
        {"construct": "response_effectiveness",
         "why": "Updates are installed when people believe protection software prevents breaches."},
        {"construct": "response_cost",
         "why": "Update prompts interrupt work and can cause problems, so they feel costly."},
        {"construct": "perceived_susceptibility",
         "why": "Unpatched software matters more to people who feel exposed to a breach."},
    ],
}

TTAT_LOW_SCORE_MEANING = {
    "perceived_susceptibility": "you do not feel that you could personally be the target of a security breach",
    "perceived_severity": "you do not see a security breach as a serious problem for you",
    "perceived_threat": "you do not feel that security breaches threaten your privacy, data or devices",
    "response_effectiveness": "you doubt that security software really prevents breaches",
    "self_efficacy": "you do not feel able to install and use security software on your own",
    "response_cost": "you find security software too time-consuming, costly or inconvenient",
}


def _related_with_scores(subscale, pmt_profile):
    related = []
    for link in SEBIS_TO_PMT[subscale]:
        entry = {"construct": link["construct"], "why": link["why"],
                 "score": None, "level": None}
        if pmt_profile is not None:
            entry["score"] = pmt_profile["construct_scores"][link["construct"]]
            entry["level"] = pmt_profile["construct_levels"][link["construct"]]
        related.append(entry)
    return related


def link_sebis_to_pmt(sebis_profile, pmt_profile=None):
    """
    sebis_profile: the dict from sebis_scoring.build_profile()
    pmt_profile:   the dict from pmt_scoring.build_profile(), or None if
                   the user has not completed the PMT assessment yet.

    Returns a theory_links dict. Never changes the profiles passed in.
    """
    pmt_done = pmt_profile is not None
    areas = {}

    for subscale, score in sebis_profile["subscale_scores"].items():
        related = _related_with_scores(subscale, pmt_profile)

        barrier = None
        sebis_level = sebis_profile["subscale_levels"][subscale]
        if pmt_done and sebis_level != "High":
            # A barrier is only named where the behavior is NOT already strong.
            # It is the lowest-scoring related construct; a tie keeps the first
            # (most relevant) one, and it only counts if it is not itself High.
            lowest = min(related, key=lambda r: r["score"])
            if lowest["level"] != "High":
                barrier = lowest["construct"]

        areas[subscale] = {
            "sebis_score": score,
            "sebis_level": sebis_level,
            "related_constructs": related,
            "likely_barrier": barrier,
        }

    weakest = sebis_profile["weakest_area"]
    focus = {
        "weakest_sebis_area": weakest,
        "likely_barrier": areas[weakest]["likely_barrier"],
        "message": None,
    }
    if not pmt_done:
        focus["message"] = ("Complete the PMT assessment to see which motivation "
                            "factors may be holding this area back.")
    elif focus["likely_barrier"]:
        focus["message"] = (f"Your weakest security area is {weakest.replace('_', ' ')}. "
                            f"The most likely barrier is that "
                            f"{LOW_SCORE_MEANING[focus['likely_barrier']]}.")
    else:
        focus["message"] = (f"Your weakest security area is {weakest.replace('_', ' ')}, "
                            f"but your related motivation scores are all high - the gap "
                            f"is more likely habit than motivation.")

    return {
        "framework": FRAMEWORK,
        "mapping_status": MAPPING_STATUS,
        "pmt_completed": pmt_done,
        "security_intention": (
            {"score": pmt_profile["construct_scores"]["security_intention"],
             "level": pmt_profile["construct_levels"]["security_intention"]}
            if pmt_done else None
        ),
        "focus": focus,
        "areas": areas,
    }
