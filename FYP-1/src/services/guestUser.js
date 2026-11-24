import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserSession } from '../utils/session';

const GUEST_ID_KEY = 'cybershield_guest_user_id';

export async function getOrCreateGuestUserId() {
  try {
    // 1. If a real user is logged in, return their database ID (or email fallback)
    const loggedInUser = await getUserSession();
    if (loggedInUser) {
      const realId = loggedInUser.id || loggedInUser.userId || loggedInUser.email;
      if (realId) return String(realId);
    }

    // 2. Otherwise fall back to the persistent device guest ID
    const existing = await AsyncStorage.getItem(GUEST_ID_KEY);
    if (existing) return existing;

    const newId = `guest_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    await AsyncStorage.setItem(GUEST_ID_KEY, newId);
    return newId;
  } catch (e) {
    return `guest_session_${Date.now()}`;
  }
}