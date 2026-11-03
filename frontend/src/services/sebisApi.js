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
