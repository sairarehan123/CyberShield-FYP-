// SeBIS API connection for local Expo Go development.
// Your phone and computer must be connected to the same Wi-Fi network.
// If your PC's IPv4 address changes, update API_BASE_URL below.
export const API_BASE_URL = 'http://192.168.18.142:8000';

// Temporary development ID. Authentication/Supabase will be connected by the
// team member responsible for login; do not treat this as a real user identity.
const DEVELOPMENT_USER_ID = 'expo_go_test_user';

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = typeof data.detail === 'string' ? data.detail : 'The SeBIS server returned an error.';
    throw new Error(detail);
  }
  return data;
}

export async function getSebisQuestions() {
  const response = await fetch(`${API_BASE_URL}/assessment/sebis/questions`);
  const data = await readResponse(response);
  const questions = data.questions || data.items;
  if (!Array.isArray(questions) || questions.length !== 16) {
    throw new Error('The backend did not return the expected 16 SeBIS questions.');
  }
  return {
    questions,
    scale: Array.isArray(data.scale) ? data.scale : [
      { value: 1, label: 'Never' },
      { value: 2, label: 'Rarely' },
      { value: 3, label: 'Sometimes' },
      { value: 4, label: 'Often' },
      { value: 5, label: 'Always' },
    ],
  };
}

export async function submitSebisAssessment(answers) {
  const response = await fetch(`${API_BASE_URL}/assessment/sebis/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: DEVELOPMENT_USER_ID, answers }),
  });
  return readResponse(response);
}
