import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveUserSession = async (user, token) => {
  try {
    if (token) await AsyncStorage.setItem('userToken', token);
    if (user) await AsyncStorage.setItem('userData', JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user session:', error);
  }
};

export const getUserSession = async () => {
  try {
    const data = await AsyncStorage.getItem('userData');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading user session:', error);
    return null;
  }
};

export const clearUserSession = async () => {
  try {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
  } catch (error) {
    console.error('Error clearing user session:', error);
  }
};