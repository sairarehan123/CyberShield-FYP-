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
import { Ionicons } from '@expo/vector-icons';
import ScreenBackground from '../components/ScreenBackground';
import AuthHeader from '../components/AuthHeader';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import SocialButtons from '../components/SocialButtons';
import { validateEmail } from '../utils/validation';
import { colors, spacing, typography } from '../theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const passwordRef = useRef(null);

  const handleLogin = () => {
    const e = {
      email: validateEmail(email),
      password: password ? '' : 'Password is required.',
    };
    setErrors(e);
    if (e.email || e.password) return;
    // TODO: call real auth API here.
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
              title="Welcome Back"
              subtitle="Continue your journey toward a safer digital life."
              onBack={navigation.canGoBack() ? navigation.goBack : undefined}
            />

            <CustomInput
              label="Email Address"
              icon="mail-outline"
              placeholder="you@example.com"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (errors.email) setErrors((p) => ({ ...p, email: '' }));
              }}
              error={errors.email}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
            <CustomInput
              ref={passwordRef}
              label="Password"
              icon="lock-closed-outline"
              placeholder="Enter your password"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (errors.password) setErrors((p) => ({ ...p, password: '' }));
              }}
              error={errors.password}
              secureTextEntry
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <View style={styles.row}>
              <Pressable
                style={styles.remember}
                onPress={() => setRemember((r) => !r)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: remember }}
                accessibilityLabel="Remember me"
              >
                <View style={[styles.box, remember && styles.boxOn]}>
                  {remember ? <Ionicons name="checkmark" size={14} color={colors.white} /> : null}
                </View>
                <Text style={styles.rememberText}>Remember Me</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Forgot password"
                onPress={() => {}}
                hitSlop={8}
              >
                <Text style={styles.link}>Forgot Password?</Text>
              </Pressable>
            </View>

            <CustomButton title="Log In" onPress={handleLogin} />
            <SocialButtons />

            <View style={styles.bottom}>
              <Text style={styles.muted}>Don't have an account? </Text>
              <Pressable
                onPress={() => navigation.navigate('SignUp')}
                accessibilityRole="button"
                accessibilityLabel="Sign up"
                hitSlop={8}
              >
                <Text style={styles.link}>Sign Up</Text>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: -spacing.xs,
  },
  remember: { flexDirection: 'row', alignItems: 'center' },
  box: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  boxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  rememberText: { ...typography.label, color: colors.text },
  link: { ...typography.label, color: colors.primary },
  muted: { ...typography.body, color: colors.textSecondary },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
});
