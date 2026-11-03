import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

export default function SignUpScreen({ navigation }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const emailRef = useRef(null);
  const passRef = useRef(null);
  const confirmRef = useRef(null);

  const update = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: '' }));
  };

  const handleSignUp = () => {
    const e = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirm: validateConfirm(form.password, form.confirm),
    };
    setErrors(e);
    if (Object.values(e).some(Boolean)) return;
    // TODO: call real registration API here.
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
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
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => passRef.current?.focus()}
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
            />

            <CustomButton
              title="Create Account"
              onPress={handleSignUp}
              style={{ marginTop: spacing.sm }}
            />
            <SocialButtons />

            <View style={styles.bottom}>
              <Text style={styles.muted}>Already have an account? </Text>
              <Pressable
                onPress={() => navigation.navigate('Login')}
                accessibilityRole="button"
                accessibilityLabel="Log in"
                hitSlop={8}
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
