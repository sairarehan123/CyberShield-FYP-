import React, { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme';

const CustomInput = forwardRef(function CustomInput(
  { label, icon, error, secureTextEntry = false, style, onFocus, onBlur, ...rest },
  ref
) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secureTextEntry);

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.field, focused && styles.focused, !!error && styles.errorField]}>
        {icon ? (
          <Ionicons
            name={icon}
            size={20}
            color={focused ? colors.primary : colors.textSecondary}
            style={styles.leftIcon}
          />
        ) : null}
        <TextInput
          ref={ref}
          style={styles.input}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={hidden}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel={label}
          {...rest}
          onFocus={(e) => {
            setFocused(true);
            onFocus && onFocus(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur && onBlur(e);
          }}
        />
        {secureTextEntry ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
          >
            <Ionicons
              name={hidden ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <View style={styles.errorRow} accessibilityLiveRegion="polite">
          <Ionicons name="alert-circle" size={14} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
});

export default CustomInput;

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.lg },
  label: { ...typography.label, color: colors.text, marginBottom: spacing.sm },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 54,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  focused: { borderColor: colors.primaryLight },
  errorField: { borderColor: colors.error, backgroundColor: colors.errorBg },
  leftIcon: { marginRight: spacing.md },
  input: { flex: 1, ...typography.body, color: colors.text, paddingVertical: 12 },
  errorRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  errorText: { ...typography.caption, color: colors.error, marginLeft: 4, flexShrink: 1 },
});
