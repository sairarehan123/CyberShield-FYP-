import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import {
  getChat, sendChat, setBackground, setTheory, startQuiz, submitQuiz, giveConsent, saveContact, clickMessage, reportMessage,
} from './api';

const POLL_MS = 20000;

/**
 * All the chatbot's state and actions in one place. The backend owns the logic (stages, quiz answers,
 * grading, the 7-day check); this hook only asks it and keeps the latest answer in `chat`.
 */
export default function useTrainingChat(userId) {
  const [chat, setChat] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(null);   // the user's message shown before the server echoes it
  const [debrief, setDebrief] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [actingId, setActingId] = useState(null);
  const alive = useRef(true);

  const load = useCallback(async (quiet = false) => {
    try {
      const data = await getChat(userId);
      if (!alive.current) return;
      setChat(data);
      setError(null);
    } catch (e) {
      if (alive.current && !quiet) setError({ message: e.message, needsAssessment: /sebis|assess/i.test(e.message) });
    }
  }, [userId]);

  useEffect(() => {
    alive.current = true;
    load();
    return () => { alive.current = false; };
  }, [load]);

  // While the 7-day check runs, look for new messages every 20 seconds.
  const watching = !!(chat && chat.inbox);
  useEffect(() => {
    if (!watching) return undefined;
    const t = setInterval(() => load(true), POLL_MS);
    return () => clearInterval(t);
  }, [watching, load]);

  const fail = (title) => (e) => Alert.alert(title, e.message);

  const send = useCallback(async (text) => {
    const t = (text || '').trim();
    if (!t || busy) return;
    setPending(t);
    setBusy(true);
    try { await sendChat(userId, t); } catch (e) { fail('Could not send')(e); }
    await load(true);
    if (alive.current) { setPending(null); setBusy(false); }
  }, [userId, busy, load]);

  const beginQuiz = useCallback(async () => {
    setBusy(true);
    try { await startQuiz(userId); await load(true); } catch (e) { fail('Could not start the quiz')(e); }
    if (alive.current) setBusy(false);
  }, [userId, load]);

  const submitAnswers = useCallback(async (answers) => {
    setBusy(true);
    try {
      const r = await submitQuiz(userId, answers);
      if (alive.current) setQuizResult(r);
      await load(true);
    } catch (e) { fail('Could not submit')(e); }
    if (alive.current) setBusy(false);
  }, [userId, load]);

  const accept = useCallback(async (email) => {
    setBusy(true);
    try {
      if (email) {
        try { await saveContact(userId, email); } catch (e) { Alert.alert('Email not saved', e.message); }
      }
      await giveConsent(userId, true);
      await load(true);
    } catch (e) { fail('Could not save')(e); }
    if (alive.current) setBusy(false);
  }, [userId, load]);

  const chooseBackground = useCallback(async (value) => {
    try { await setBackground(userId, value); await load(true); } catch (e) { fail('Could not save')(e); }
  }, [userId, load]);

  const chooseTheory = useCallback(async (key) => {
    setBusy(true);
    try {
      const data = await setTheory(userId, key);
      if (alive.current) setChat(data);
    } catch (e) { fail('Could not save your choice')(e); }
    if (alive.current) setBusy(false);
  }, [userId]);

  const act = useCallback(async (fn, msg) => {
    setActingId(msg.id);
    try {
      const r = await fn(userId, msg.id);
      await load(true);
      if (alive.current && r && r.debrief) setDebrief(r.debrief);
    } catch (e) {
      await load(true); // most likely the message just closed
      Alert.alert('Message closed', e.message);
    }
    if (alive.current) setActingId(null);
  }, [userId, load]);

  return {
    chat, error, busy, pending, debrief, quizResult, actingId,
    send, beginQuiz, submitAnswers, accept, chooseBackground, chooseTheory,
    clickLink: (m) => act(clickMessage, m),
    reportMsg: (m) => act(reportMessage, m),
    refresh: () => load(true),
    reload: () => { setError(null); return load(); },
    closeDebrief: () => setDebrief(null),
    showDebrief: setDebrief,
    closeQuizResult: () => setQuizResult(null),
  };
}
