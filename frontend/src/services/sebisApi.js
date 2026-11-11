/**
 * CyberShield - SeBIS / PMT API service
 *
 * Talks to the FastAPI backend (backend/main.py). Does NOT calculate
 * any scores itself - the backend is the only source of truth.
 *
 * Set the backend address in a file called .env in the project root
 * (it is git-ignored, so your IP never gets pushed):
 *
 *   EXPO_PUBLIC_API_URL=http://192.168.1.20:8000
 *
 *   - Android emulator:  http://10.0.2.2:8000   (the default below)
 *   - iOS simulator:     http://localhost:8000
 *   - Physical phone:    http://<your-computer's-local-IP>:8000
 *                        (phone and computer on the same WiFi;
 *                         run  ipconfig  to find your IPv4 address)
 * Restart with  npx expo start -c  after changing .env.
 */

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000';

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (networkError) {
    throw new Error(
      'Could not reach the server. Check your internet connection and that the backend is running.'
    );
  }

  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    throw new Error('The server sent back something unexpected. Please try again.');
  }

  if (!response.ok) {
    throw new Error(data.detail || 'Something went wrong. Please try again.');
  }

  return data;
}

export function fetchQuestions() {
  return request('/assessment/sebis/questions');
}

export function submitAssessment(userId, answers) {
  return request('/assessment/sebis/score', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, answers }),
  });
}

export function fetchResultById(assessmentId) {
  return request(`/assessment/sebis/results/${assessmentId}`);
}

// ---------------------------------------------------------------------
// PMT (Protection Motivation Theory) + the combined SeBIS/PMT profile.
// Use the SAME userId for SeBIS and PMT (getOrCreateGuestUserId() in
// guestUser.js until real login is connected) - that is what links them.
// ---------------------------------------------------------------------
export function fetchPmtQuestions() {
  return request('/assessment/pmt/questions'); // 30 items, 7-point scale
}

export function submitPmt(userId, answers) {
  return request('/assessment/pmt/score', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, answers }),
  });
}

// Latest SeBIS + latest PMT for this user, plus theory_links (the connection).
export function fetchCombinedProfile(userId) {
  return request(`/assessment/profile/${encodeURIComponent(userId)}`);
}

// ---------------------------------------------------------------------
// TPB (Theory of Planned Behavior, 14 items) and TTAT (Technology Threat
// Avoidance Theory, 35 items). Both use a 1-7 scale and the SAME userId.
// ---------------------------------------------------------------------
export function fetchTpbQuestions() {
  return request('/assessment/tpb/questions');
}

export function submitTpb(userId, answers) {
  return request('/assessment/tpb/score', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, answers }),
  });
}

export function fetchTtatQuestions() {
  return request('/assessment/ttat/questions');
}

export function submitTtat(userId, answers) {
  return request('/assessment/ttat/score', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, answers }),
  });
}

// THE main call for the result screens: SeBIS + every completed theory in ONE
// profile, with the weak areas and the likely reasons (training_brief).
// Returns a 404 error ("Complete SeBIS first") if the user has no SeBIS yet.
export function fetchUserProfile(userId) {
  return request(`/assessment/user-profile/${encodeURIComponent(userId)}`);
}
