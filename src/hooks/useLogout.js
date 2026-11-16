import { Alert } from 'react-native';

// Simple logout: asks for confirmation, then goes back to the Login screen.
export default function useLogout(navigation) {
  return () =>
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }),
      },
    ]);
}