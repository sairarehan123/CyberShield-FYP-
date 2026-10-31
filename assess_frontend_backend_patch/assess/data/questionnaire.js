// The approved SeBIS instrument. The assessment screen also fetches these
// questions from FastAPI, so the backend remains the source of truth.
export const QUESTIONNAIRE = {
  version: 'sebis-16-v1',
  isPlaceholder: false,
  scale: [
    { value: 1, label: 'Never' },
    { value: 2, label: 'Rarely' },
    { value: 3, label: 'Sometimes' },
    { value: 4, label: 'Often' },
    { value: 5, label: 'Always' },
  ],
  categories: [
    { id: 'device_securement', label: 'Device securement', icon: 'phone-portrait-outline' },
    { id: 'password_generation', label: 'Password generation', icon: 'key-outline' },
    { id: 'proactive_awareness', label: 'Proactive awareness', icon: 'shield-checkmark-outline' },
    { id: 'updating', label: 'Software updating', icon: 'refresh-outline' },
  ],
  questions: [
    { id: 'F3', category: 'device_securement', text: 'I manually lock my computer screen when I step away from it.' },
    { id: 'F4', category: 'device_securement', text: "I set my computer screen to automatically lock if I don't use it for a prolonged period of time." },
    { id: 'F5', category: 'device_securement', text: 'I use a PIN or passcode to unlock my mobile phone.' },
    { id: 'F6', category: 'device_securement', text: 'I use a password/passcode to unlock my laptop or tablet.' },
    { id: 'F12', category: 'password_generation', text: 'I do not change my passwords, unless I have to.' },
    { id: 'F13', category: 'password_generation', text: 'I use different passwords for different accounts that I have.' },
    { id: 'F14', category: 'password_generation', text: "I do not include special characters in my password if it's not required." },
    { id: 'F15', category: 'password_generation', text: "When I create a new online account, I try to use a password that goes beyond the site's minimum requirements." },
    { id: 'F7', category: 'proactive_awareness', text: 'If I discover a security problem, I continue what I was doing because I assume someone else will fix it.' },
    { id: 'F8', category: 'proactive_awareness', text: 'When someone sends me a link, I open it without first verifying where it goes.' },
    { id: 'F10', category: 'proactive_awareness', text: 'When browsing websites, I mouseover links to see where they go, before clicking them.' },
    { id: 'F11', category: 'proactive_awareness', text: "I know what website I'm visiting based on its look and feel, rather than by looking at the URL bar." },
    { id: 'F16', category: 'proactive_awareness', text: 'I submit information to websites without first verifying that it will be sent securely (e.g., SSL, "https://", a lock icon).' },
    { id: 'F1', category: 'updating', text: "When I'm prompted about a software update, I install it right away." },
    { id: 'F2', category: 'updating', text: 'I try to make sure that the programs I use are up-to-date.' },
    { id: 'F9', category: 'updating', text: 'I verify that my anti-virus software has been regularly updating itself.' },
  ],
};

export const getCategory = (id) => QUESTIONNAIRE.categories.find((category) => category.id === id);
export const estimateMinutes = () => Math.max(1, Math.ceil((QUESTIONNAIRE.questions.length * 20) / 60));
