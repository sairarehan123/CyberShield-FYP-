/**
 * CyberShield - Training chatbot API service.
 * Backend address: see config.js.
 * The app never decides anything: the backend owns the stages, the quiz answers and the grading.
 */
import { NativeModules } from 'react-native';
import { API_URL, BACKEND_PORT } from './config';

/** Where the backend is. Manual setting first, then "the computer that serves this app", then the Android emulator. */
export function getBaseUrl() {
  if (API_URL) return API_URL.replace(/\/+$/, '');
  try {
    const script = NativeModules && NativeModules.SourceCode && NativeModules.SourceCode.scriptURL;
    const m = /^https?:\/\/([^:/]+)/.exec(script || '');
    if (m && m[1]) return `http://${m[1]}:${BACKEND_PORT}`;
  } catch (e) {
    // ignore - use the fallback below
  }
  return `http://10.0.2.2:${BACKEND_PORT}`;
}
const BASE_URL = getBaseUrl();

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options });
  } catch (networkError) {
    throw new Error(`Could not reach the server at ${BASE_URL}. Check that the backend is running, that your phone and computer are on the same WiFi, and the address in src/chatbot/config.js.`);
  }
  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    throw new Error('The server sent back something unexpected. Please try again.');
  }
  if (!response.ok) {
    throw new Error(typeof data.detail === 'string' ? data.detail : 'Something went wrong. Please try again.');
  }
  return data;
}

const base = (userId) => `/training/${encodeURIComponent(userId)}`;
const post = (path, body) => request(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) });

// The whole chat screen state: stage, messages, steps, quiz, inbox, allowed actions.
export const getChat = (userId) => request(`${base(userId)}/chat`);
export const sendChat = (userId, message) => post(`${base(userId)}/chat`, { message });
export const setTheory = (userId, theory) => post(`${base(userId)}/theory`, { theory });
export const setBackground = (userId, background) => post(`${base(userId)}/background`, { background });

export const startQuiz = (userId) => post(`${base(userId)}/chat/quiz`);
export const submitQuiz = (userId, quizAnswers) => post(`${base(userId)}/chat/quiz/submit`, { quiz_answers: quizAnswers });

export const giveConsent = (userId, accepted = true) => post(`${base(userId)}/consent`, { accepted });
export const saveContact = (userId, email, pushToken) => {
  const body = {};
  if (email) body.email = email;
  if (pushToken) body.push_token = pushToken;
  return post(`${base(userId)}/contact`, body);
};

// Simulated messages (the user's inbox).
export const clickMessage = (userId, messageId) => post(`${base(userId)}/drill/${encodeURIComponent(messageId)}/click`);
export const reportMessage = (userId, messageId) => post(`${base(userId)}/drill/${encodeURIComponent(messageId)}/report`);
