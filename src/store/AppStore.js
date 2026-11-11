import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { storage } from '../services/storage';

/**
 * App-wide state (Phase 1: completed assessments only).
 * Each saved assessment keeps the RAW answers, so Phase 2 (Results) can compute and display scores
 * from them without changing anything here:
 *   { id, completedAt, questionnaireVersion, isPlaceholder, questionCount, answers: { [questionId]: value } }
 */
const initialState = { hydrated: false, assessments: [] }; // newest first

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload, hydrated: true };
    case 'SAVE_ASSESSMENT':
      return { ...state, assessments: [action.assessment, ...state.assessments] };
    case 'RESET':
      return { ...initialState, hydrated: true };
    default:
      return state;
  }
}

const AppStoreContext = createContext(null);

export function AppStoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    let active = true;
    storage.load().then((saved) => {
      if (active) dispatch({ type: 'HYDRATE', payload: saved || {} });
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    const { hydrated, ...persist } = state;
    storage.save(persist);
  }, [state]);

  const saveAssessment = useCallback((data) => {
    const assessment = { id: `a_${Date.now()}`, completedAt: new Date().toISOString(), ...data };
    dispatch({ type: 'SAVE_ASSESSMENT', assessment });
    return assessment;
  }, []);

  const reset = useCallback(() => {
    storage.clear();
    dispatch({ type: 'RESET' });
  }, []);

  const value = useMemo(() => ({ state, saveAssessment, reset }), [state, saveAssessment, reset]);
  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error('useAppStore must be used inside AppStoreProvider');
  return ctx;
}
