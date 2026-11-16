import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import SettingsScreen from '../screens/SettingsScreen';

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

// TPB screens
import TPBIntroScreen from '../screens/TPBIntroScreen';
import TPBQuestionnaireScreen from '../screens/TPBQuestionnaireScreen';
import TPBReviewScreen from '../screens/TPBReviewScreen';
import TPBReportScreen from '../screens/TPBReportScreen';

// TTAT screens
import TTATIntroScreen from '../screens/TTATIntroScreen';
import TTATQuestionnaireScreen from '../screens/TTATQuestionnaireScreen';
import TTATReviewScreen from '../screens/TTATReviewScreen';
import TTATReportScreen from '../screens/TTATReportScreen';

// Combined 4-Subscale Final Report
import Unified4SubscaleReportScreen from '../screens/Unified4SubscaleReportScreen';
import Chatbot from '../chatbot';

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
        <Stack.Screen name="Settings" component={SettingsScreen} />

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

        {/* TPB flow */}
        <Stack.Screen name="TPBIntro" component={TPBIntroScreen} />
        <Stack.Screen name="TPBQuestionnaire" component={TPBQuestionnaireScreen} />
        <Stack.Screen name="TPBReview" component={TPBReviewScreen} />
        <Stack.Screen name="TPBReport" component={TPBReportScreen} />

        {/* TTAT flow */}
        <Stack.Screen name="TTATIntro" component={TTATIntroScreen} />
        <Stack.Screen name="TTATQuestionnaire" component={TTATQuestionnaireScreen} />
        <Stack.Screen name="TTATReview" component={TTATReviewScreen} />
        <Stack.Screen name="TTATReport" component={TTATReportScreen} />

        {/* Combined 4-Subscale Final Report */}
        <Stack.Screen
          name="Unified4SubscaleReport"
          component={Unified4SubscaleReportScreen}
        />
        <Stack.Screen name="Chatbot" component={Chatbot} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}