import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ScreenBackground from '../components/ScreenBackground';
import AuthHeader from '../components/AuthHeader';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import SocialButtons from '../components/SocialButtons';

import {
  validateConfirm,
  validateEmail,
  validateName,
  validatePassword,
} from '../utils/validation';
import { colors, spacing, typography } from '../theme';
import { apiCall } from '../config/api';

export default function SignUpScreen({ navigation }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const emailRef = useRef(null);
  const passRef = useRef(null);
  const confirmRef = useRef(null);

  const update = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: '' }));
  };

  const handleSignUp = async () => {
    // 1. Run validation
    const e = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirm: validateConfirm(form.password, form.confirm),
    };
    setErrors(e);

    // 🔍 Debug check: Show active validation errors if any field fails
    const activeErrors = Object.entries(e)
      .filter(([_, value]) => Boolean(value))
      .map(([key, val]) => `${key}: ${val}`)
      .join('\n');

    if (activeErrors) {
      Alert.alert('Validation Error', activeErrors);
      return;
    }

    try {
      setLoading(true);

      // 2. Call Express registration backend endpoint
      const response = await apiCall('/auth/register', 'POST', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        confirm: form.confirm,
      });

      if (response.success) {
        // 3. Save access token if session exists
        if (response.data?.session?.accessToken) {
          await AsyncStorage.setItem('userToken', response.data.session.accessToken);
        }

        Alert.alert('Success', 'Account created successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Home' }] }),
          },
        ]);
      } else {
        const errorMsg = response.error?.message || 'Failed to create account. Please try again.';
        Alert.alert('Registration Error', errorMsg);
      }
    } catch (err) {
      Alert.alert('Network Error', 'Unable to connect to server. Check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenBackground circuit={false}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.safe}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <AuthHeader
              title="Create Account"
              subtitle="Start your journey toward better cybersecurity habits."
              onBack={navigation.canGoBack() ? navigation.goBack : undefined}
            />

            <CustomInput
              label="Full Name"
              icon="person-outline"
              placeholder="Your full name"
              value={form.name}
              onChangeText={update('name')}
              error={errors.name}
              autoCapitalize="words"
              textContentType="name"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              editable={!loading}
            />
            <CustomInput
              ref={emailRef}
              label="Email Address"
              icon="mail-outline"
              placeholder="you@example.com"
              value={form.email}
              onChangeText={update('email')}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => passRef.current?.focus()}
              editable={!loading}
            />
            <CustomInput
              ref={passRef}
              label="Password"
              icon="lock-closed-outline"
              placeholder="At least 8 characters"
              value={form.password}
              onChangeText={update('password')}
              error={errors.password}
              secureTextEntry
              textContentType="newPassword"
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
              editable={!loading}
            />
            <CustomInput
              ref={confirmRef}
              label="Confirm Password"
              icon="shield-checkmark-outline"
              placeholder="Re-enter your password"
              value={form.confirm}
              onChangeText={update('confirm')}
              error={errors.confirm}
              secureTextEntry
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={handleSignUp}
              editable={!loading}
            />

            <CustomButton
              title={loading ? 'Creating Account...' : 'Create Account'}
              onPress={handleSignUp}
              disabled={loading}
              style={{ marginTop: spacing.sm }}
            >
              {loading && <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />}
            </CustomButton>

            <SocialButtons />

            <View style={styles.bottom}>
              <Text style={styles.muted}>Already have an account? </Text>
              <Pressable
                onPress={() => navigation.navigate('Login')}
                accessibilityRole="button"
                accessibilityLabel="Log in"
                hitSlop={8}
                disabled={loading}
              >
                <Text style={styles.link}>Log In</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  link: { ...typography.label, color: colors.primary },
  muted: { ...typography.body, color: colors.textSecondary },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
});