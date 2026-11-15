/**
 * Chatbot settings - the ONLY file you may need to edit.
 *
 * ASSISTANT_NAME   the name of the chatbot (shown on the splash, home and chat screens).
 * ASSISTANT_TAGLINE  one short line under the name.
 * API_URL     the backend address. Use the computer's address, e.g. 'http://192.168.18.142:8000'
 *             (find the number with  ipconfig  -> IPv4 Address). '' = try to find it automatically.
 * BACKEND_PORT  the port the backend runs on.
 * DEFAULT_USER_ID  used only when no user is passed in. In the real app, pass the logged-in user:
 *             navigation.navigate('Chatbot', { userId, userName })
 */
export const ASSISTANT_NAME = 'Aegis';
export const ASSISTANT_TAGLINE = 'Your personal security coach';
export const API_URL = 'http://192.168.18.142:8000';
export const BACKEND_PORT = 8000;
export const DEFAULT_USER_ID = 'Saira';
