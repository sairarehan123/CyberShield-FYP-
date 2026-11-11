/**
 * Presentation helpers for the PMT report. NOTHING here calculates a score: every number shown comes
 * straight from the backend response. This file only supplies readable labels / explanations and a
 * safe way to read the nested combined-profile response.
 */

// Display names + one-line explanations for the PMT constructs the backend returns.
export const PMT_CONSTRUCTS = {
  perceived_severity: {
    label: 'Perceived Severity',
    note: 'How serious you think a security incident would be for you.',
  },
  perceived_vulnerability: {
    label: 'Perceived Vulnerability',
    note: 'How likely you feel you are to be affected by a security threat.',
  },
  response_efficacy: {
    label: 'Response Efficacy',
    note: 'How much you believe security measures really protect you.',
  },
  self_efficacy: {
    label: 'Self-Efficacy',
    note: 'How confident you feel taking the steps to protect your devices.',
  },
  response_cost: {
    label: 'Response Cost',
    // The backend reverse-scores this construct, so we only EXPLAIN the direction here.
    note: 'Reverse-scored: a higher score means you find security measures less costly or inconvenient.',
  },
  security_intention: {
    label: 'Security Intention',
    note: 'How strongly you intend to take security measures on your devices.',
  },
};

// How the constructs are grouped on screen (display only).
export const PMT_GROUPS = [
  {
    key: 'threat',
    title: 'Threat appraisal',
    description: 'How serious and how personal online threats feel to you.',
    constructs: ['perceived_severity', 'perceived_vulnerability'],
  },
  {
    key: 'coping',
    title: 'Coping appraisal',
    description: 'How effective, doable and low-effort protective actions feel to you.',
    constructs: ['response_efficacy', 'self_efficacy', 'response_cost'],
  },
  {
    key: 'intention',
    title: 'Intention',
    description: 'Your intention to act. Reported separately: it is not part of the overall score.',
    constructs: ['security_intention'],
  },
];

export const SEBIS_AREA_LABELS = {
  device_securement: 'Device Securement',
  password_generation: 'Password Generation',
  proactive_awareness: 'Proactive Awareness',
  updating: 'Staying Up-to-Date',
};

export const DRAFT_MAPPING_STATUS = 'draft_pending_supervisor_approval';

/** 'some_key' -> 'Some Key' (fallback for any construct/area the labels above do not know). */
export function prettify(key) {
  return String(key || '')
    .split('_')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export const constructLabel = (key) => (PMT_CONSTRUCTS[key] ? PMT_CONSTRUCTS[key].label : prettify(key));
export const sebisAreaLabel = (key) => SEBIS_AREA_LABELS[key] || prettify(key);

/** True unless the backend explicitly reports a non-draft mapping status. */
export function isDraftMapping(status) {
  if (!status) return true; // unknown -> stay cautious
  return status === DRAFT_MAPPING_STATUS || /draft|pending/i.test(status);
}

/**
 * Reads GET /assessment/profile/{user_id} safely. PMT numbers live in data.pmt.profile (NOT directly in
 * the combined profile); SeBIS in data.sebis.profile; theory_links is null until SeBIS is completed.
 */
export function extractReport(data) {
  const pmtProfile = data && data.pmt && data.pmt.profile ? data.pmt.profile : null;
  const sebisProfile = data && data.sebis && data.sebis.profile ? data.sebis.profile : null;
  const theoryLinks = data && data.theory_links ? data.theory_links : null;
  const hasPmt = Boolean(pmtProfile && pmtProfile.construct_scores);
  const hasSebis = Boolean(sebisProfile && sebisProfile.subscale_scores);

  // Known constructs first (in display order), then any extra the backend might add later.
  const known = PMT_GROUPS.flatMap((g) => g.constructs);
  const scores = hasPmt ? pmtProfile.construct_scores : {};
  const extra = Object.keys(scores).filter((k) => !known.includes(k));

  return {
    hasPmt,
    hasSebis,
    pmtProfile,
    sebisProfile,
    theoryLinks,
    areas: theoryLinks && theoryLinks.areas ? Object.entries(theoryLinks.areas) : [],
    extraConstructs: extra,
  };
}
