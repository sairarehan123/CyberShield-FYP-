/**
 * LIMITATION: user authentication is not yet connected to the SeBIS
 * assessment backend. Until it is, each device gets a persistent
 * "guest" ID stored locally, so that repeated visits on the same
 * device are treated as the same user (this is what makes the
 * reassessment/comparison feature testable right now).
 *
 * Once real auth exists, replace calls to getOrCreateGuestUserId()
 * with the actual logged-in user's ID, and this file can be removed.
 *
 * Requires: @react-native-async-storage/async-storage
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const GUEST_ID_KEY = 'cybershield_guest_user_id';

export async function getOrCreateGuestUserId() {
  try {
    const existing = await AsyncStorage.getItem(GUEST_ID_KEY);
    if (existing) return existing;

    const newId = `guest_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    await AsyncStorage.setItem(GUEST_ID_KEY, newId);
    return newId;
  } catch (e) {
    // Fallback if storage fails for any reason - not persistent, but
    // keeps the app usable rather than crashing.
    return `guest_session_${Date.now()}`;
  }
}
