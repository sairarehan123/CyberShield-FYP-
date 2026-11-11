
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';

import MainTabsScreen from '../screens/MainTabsScreen';

// SeBIS screens
import SeBISIntroScreen from '../screens/SeBISIntroScreen';
import SeBISQuestionnaireScreen from '../screens/SeBISQuestionnaireScreen';
import SeBISReviewScreen from '../screens/SeBISReviewScreen';
import SeBISReportScreen from '../screens/SeBISReportScreen';

// PMT screens
import PMTIntroScreen from '../screens/PMTIntroScreen';
import PMTQuestionnaireScreen from '../screens/PMTQuestionnaireScreen';
import PMTReviewScreen from '../screens/PMTReviewScreen';
import PMTReportScreen from '../screens/PMTReportScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />

        {/* Main app with bottom navigation */}
        <Stack.Screen name="Home" component={MainTabsScreen} />

        {/* SeBIS flow */}
        <Stack.Screen name="SeBISIntro" component={SeBISIntroScreen} />
        <Stack.Screen name="SeBISQuestionnaire" component={SeBISQuestionnaireScreen} />
        <Stack.Screen name="SeBISReview" component={SeBISReviewScreen} />
        <Stack.Screen name="SeBISReport" component={SeBISReportScreen} />

        {/* PMT flow */}
        <Stack.Screen name="PMTIntro" component={PMTIntroScreen} />
        <Stack.Screen name="PMTQuestionnaire" component={PMTQuestionnaireScreen} />
        <Stack.Screen name="PMTReview" component={PMTReviewScreen} />
        <Stack.Screen name="PMTReport" component={PMTReportScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
