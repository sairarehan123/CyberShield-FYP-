/**
 * ASSESSMENT QUESTIONNAIRE — DEVELOPMENT PLACEHOLDER (not the approved instrument)
 *
 * The approved questionnaire (SeBIS-based, with PMT / TPB / TTAT constructs) is not connected yet.
 * The statements below are NOT validated SeBIS items. They only exist so the assessment flow can be
 * built and tested end to end.
 *
 * TO INTEGRATE THE REAL QUESTIONNAIRE: replace `scale`, `categories` and `questions`, and set
 * `isPlaceholder: false`. The assessment UI reads everything from this object, so no screen code
 * needs to change. Scoring is intentionally NOT implemented here: it belongs to Phase 2 (Results)
 * and will read the raw answers saved by the store.
 */
export const QUESTIONNAIRE = {
  version: 'dev-placeholder-0',
  isPlaceholder: true,
  scale: [
    { value: 1, label: 'Never' },
    { value: 2, label: 'Rarely' },
    { value: 3, label: 'Sometimes' },
    { value: 4, label: 'Often' },
    { value: 5, label: 'Always' },
  ],
  categories: [
    { id: 'passwords', label: 'Passwords', icon: 'key-outline' },
    { id: 'accounts', label: 'Account protection', icon: 'lock-closed-outline' },
    { id: 'phishing', label: 'Links & messages', icon: 'link-outline' },
    { id: 'updates', label: 'Software updates', icon: 'refresh-outline' },
    { id: 'privacy', label: 'Privacy', icon: 'eye-off-outline' },
  ],
  questions: [
    { id: 'q1', category: 'passwords', text: 'I use a different password for each of my important accounts.' },
    { id: 'q2', category: 'passwords', text: 'I use a password manager or another secure way to store my passwords.' },
    { id: 'q3', category: 'accounts', text: 'I use two-step verification on my important accounts.' },
    { id: 'q4', category: 'accounts', text: 'I review which devices and apps have access to my accounts.' },
    { id: 'q5', category: 'phishing', text: 'I check where a link leads before I open it.' },
    { id: 'q6', category: 'phishing', text: 'I stop and verify unexpected messages that ask for personal details or urgent action.' },
    { id: 'q7', category: 'updates', text: 'I install software and app updates soon after they become available.' },
    { id: 'q8', category: 'updates', text: "I keep my phone's operating system up to date." },
    { id: 'q9', category: 'privacy', text: 'I review the privacy settings of the apps and services I use.' },
    { id: 'q10', category: 'privacy', text: 'I think carefully before sharing personal details online.' },
  ],
};

export const getCategory = (id) => QUESTIONNAIRE.categories.find((c) => c.id === id);
export const estimateMinutes = () => Math.max(1, Math.ceil((QUESTIONNAIRE.questions.length * 20) / 60));
