import Constants from 'expo-constants';

const getBaseUrl = () => {
  // Automatically grabs your PC's current Wi-Fi IP from Expo (works at home, uni, hotspot, etc.)
  const debuggerHost =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    Constants.manifest?.debuggerHost;

  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    return `http://${ip}:8000/api`;
  }

  // Fallback for Android Emulator
  return 'http://10.0.2.2:8000/api';
};

const BASE_URL = getBaseUrl();

export const apiCall = async (endpoint, method = 'GET', body = null, token = null) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      method,
      headers,
      signal: controller.signal,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    clearTimeout(timeoutId);

    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`Network Error (${BASE_URL}${endpoint}):`, error);
    return {
      success: false,
      error: {
        message:
          error.name === 'AbortError'
            ? 'Server timed out. Check that your auth backend is running on port 4000.'
            : `Cannot connect to ${BASE_URL}. Make sure your backend is running on port 4000!`,
      },
    };
  }
};