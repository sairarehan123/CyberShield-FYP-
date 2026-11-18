import Constants from 'expo-constants';

/**
 * Chatbot settings - the ONLY file you may need to edit.
 *
 * ASSISTANT_NAME    the name of the chatbot (shown on the splash, home and chat screens).
 * ASSISTANT_TAGLINE one short line under the name.
 * API_URL           the backend address. Automatically detects your PC's IP from Expo.
 * BACKEND_PORT      the port the backend runs on.
 * DEFAULT_USER_ID   used only when no user is passed in. In the real app, pass the logged-in user:
 *                   navigation.navigate('Chatbot', { userId, userName })
 */
export const ASSISTANT_NAME = 'Aegis';
export const ASSISTANT_TAGLINE = 'Your personal security coach';
export const BACKEND_PORT = 8000;

const getAutoApiUrl = () => {
  const debuggerHost =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    Constants.manifest?.debuggerHost;

  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    return `http://${ip}:${BACKEND_PORT}`;
  }

  return '';
};

export const API_URL = getAutoApiUrl();
export const DEFAULT_USER_ID = 'Saira';