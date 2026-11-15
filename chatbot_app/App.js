import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Chatbot from './src/chatbot';

// Stand-alone host: the app opens directly on the chatbot (no splash, login or assessment).
// In the real app this screen is just one more <Stack.Screen> - see src/chatbot/index.js.
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Chatbot" component={Chatbot} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
