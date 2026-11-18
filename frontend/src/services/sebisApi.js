import Constants from 'expo-constants';

/**
 * CyberShield - SeBIS / PMT / TPB / TTAT API service
 *
 * Talks to the FastAPI backend (backend/main.py). Does NOT calculate
 * any scores itself - the backend is the only source of truth.
 *
 * How BASE_URL is chosen automatically:
 * 1. If EXPO_PUBLIC_API_URL is set in .env (e.g. an ngrok URL), it uses that.
 * 2. Otherwise, it auto-detects your laptop's current Wi-Fi / hotspot IP
 *    from Expo Metro and attaches port :8000 (so switching between home
 *    Wi-Fi, uni Wi-Fi, or mobile hotspot works without editing IP addresses).
 * 3. Falls back to http://10.0.2.2:8000 for Android Studio Emulator.
 */

function getDevServerIp() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    Constants.manifest?.debuggerHost;

  if (!hostUri) return null;

  // hostUri looks like "192.168.18.77:8081" -> extracts "192.168.18.77"
  const host = hostUri.split(':')[0];

  // Ignore tunnel hostnames (ngrok / exp.direct) so we don't attach :8000 to them
  if (host.includes('ngrok') || host.includes('exp.direct')) return null;

  return host;
}

const detectedIp = getDevServerIp();
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (detectedIp ? `http://${detectedIp}:8000` : 'http://10.0.2.2:8000');

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...(options.headers || {}),
      },
    });
  } catch (networkError) {
    if (networkError.name === 'AbortError') {
      throw new Error(
        `Connection timed out reaching ${BASE_URL}. Make sure the backend is running with --host 0.0.0.0.`
      );
    }
    throw new Error(
      `Could not reach the server (${BASE_URL}). Check your connection and that the backend is running.`
    );
  } finally {
    clearTimeout(timeoutId);
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

// ---------------------------------------------------------------------
// SeBIS (Security Behavior Intentions Scale)
// ---------------------------------------------------------------------

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
  return request(`/assessment/sebis/results/${encodeURIComponent(assessmentId)}`);
}

export async function fetchLatestProfile(userId) {
  const data = await request(`/assessment/user-profile/${encodeURIComponent(userId)}`);
  if (!data?.sebis) {
    throw new Error('We could not find your SeBIS results yet.');
  }
  return { profile: data.sebis };
}
// ---------------------------------------------------------------------
// PMT (Protection Motivation Theory) + Combined Profile
// ---------------------------------------------------------------------

export function fetchPmtQuestions() {
  return request('/assessment/pmt/questions');
}

export function submitPmt(userId, answers) {
  return request('/assessment/pmt/score', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, answers }),
  });
}

export function fetchCombinedProfile(userId) {
  return request(`/assessment/profile/${encodeURIComponent(userId)}`);
}

export function fetchUnifiedUserProfile(userId) {
  return request(`/assessment/user-profile/${encodeURIComponent(userId)}`);
}

// ---------------------------------------------------------------------
// TPB (Theory of Planned Behavior)
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

export function fetchTpbResultById(assessmentId) {
  return request(`/assessment/tpb/results/${encodeURIComponent(assessmentId)}`);
}

// ---------------------------------------------------------------------
// TTAT (Technology Threat Avoidance Theory)
// ---------------------------------------------------------------------

export function fetchTtatQuestions() {
  return request('/assessment/ttat/questions');
}

export function submitTtat(userId, answers) {
  return request('/assessment/ttat/score', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, answers }),
  });
}

export function fetchTtatResultById(assessmentId) {
  return request(`/assessment/ttat/results/${encodeURIComponent(assessmentId)}`);
}