import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import SeBISIntroScreen from '../screens/SeBISIntroScreen';
import SeBISQuestionnaireScreen from '../screens/SeBISQuestionnaireScreen';
import SeBISReviewScreen from '../screens/SeBISReviewScreen';
import SeBISReportScreen from '../screens/SeBISReportScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false, animation: 'fade' }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="SeBISIntro" component={SeBISIntroScreen} />
        <Stack.Screen name="SeBISQuestionnaire" component={SeBISQuestionnaireScreen} />
        <Stack.Screen name="SeBISReview" component={SeBISReviewScreen} />
        <Stack.Screen name="SeBISReport" component={SeBISReportScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
