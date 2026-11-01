import { Alert } from 'react-native';

const BASE_URL = 'http://192.168.18.98:4000/api'; 

export const apiCall = async (endpoint, method = 'GET', body = null, token = null) => {
  // 🔍 DEBUG ALERT: This will prove whether your phone is triggering the API function!
  Alert.alert('DEBUG', `Calling: ${BASE_URL}${endpoint}`);

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
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Network Error:', error);
    return { 
      success: false, 
      error: { message: 'Cannot connect to backend server. Make sure PC and phone are on the same Wi-Fi!' } 
    };
  }
};