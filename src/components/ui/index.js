// src/components/ui/index.js
import React, { useRef } from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  ActivityIndicator, StyleSheet, Animated,
} from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '../../constants/theme';

// ─── PrimaryButton ────────────────────────────────────────────────────────────
export function PrimaryButton({ title, onPress, loading, disabled, style }) {
  const scale = useRef(new Animated.Value(1)).current;
  const onIn  = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true }).start();

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity
        onPress={onPress} onPressIn={onIn} onPressOut={onOut}
        disabled={disabled || loading} activeOpacity={1}
        style={[styles.btn, disabled && styles.btnDisabled]}
      >
        {loading
          ? <ActivityIndicator color="#fff" size="small" />
          : <Text style={styles.btnText}>{title}</Text>
        }
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── GhostButton ──────────────────────────────────────────────────────────────
export function GhostButton({ title, onPress, style, danger }) {
  return (
    <TouchableOpacity
      onPress={onPress} activeOpacity={0.7}
      style={[styles.ghostBtn, danger && styles.ghostBtnDanger, style]}
    >
      <Text style={[styles.ghostBtnText, danger && styles.ghostBtnTextDanger]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, error, style, containerStyle, ...props }) {
  const border = useRef(new Animated.Value(0)).current;
  const onFocus = () => Animated.timing(border, { toValue: 1, duration: 180, useNativeDriver: false }).start();
  const onBlur  = () => Animated.timing(border, { toValue: 0, duration: 180, useNativeDriver: false }).start();
  const borderColor = border.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? COLORS.danger : COLORS.border, COLORS.accent],
  });
  return (
    <View style={[styles.inputWrap, containerStyle]}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <Animated.View style={[styles.inputBox, { borderColor }]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={COLORS.textDim}
          onFocus={onFocus} onBlur={onBlur}
          {...props}
        />
      </Animated.View>
      {error ? <Text style={styles.inputError}>{error}</Text> : null}
    </View>
  );
}

// ─── StepProgressBar ─────────────────────────────────────────────────────────
export function StepProgressBar({ currentStep, totalSteps, labels }) {
  return (
    <View style={styles.stepWrap}>
      <View style={styles.stepTrack}>
        {Array.from({ length: totalSteps }).map((_, i) => {
          const n    = i + 1;
          const done = n < currentStep;
          const cur  = n === currentStep;
          return (
            <React.Fragment key={n}>
              <View style={[styles.dot, done && styles.dotDone, cur && styles.dotCur]}>
                {done
                  ? <Text style={styles.dotCheck}>✓</Text>
                  : <Text style={[styles.dotNum, cur && styles.dotNumCur]}>{n}</Text>
                }
              </View>
              {i < totalSteps - 1 && (
                <View style={[styles.line, done && styles.lineDone]} />
              )}
            </React.Fragment>
          );
        })}
      </View>
      {labels && (
        <Text style={styles.stepLbl}>
          Step {currentStep} of {totalSteps} — {labels[currentStep - 1]}
        </Text>
      )}
    </View>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style, glow }) {
  return (
    <View style={[styles.card, glow && styles.cardGlow, style]}>
      {children}
    </View>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle }) {
  return (
    <View style={styles.secHead}>
      <Text style={styles.secTitle}>{title}</Text>
      {subtitle ? <Text style={styles.secSub}>{subtitle}</Text> : null}
    </View>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
export function Divider({ style }) {
  return <View style={[styles.divider, style]} />;
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Button
  btn: {
    height: 54, borderRadius: RADIUS.md, backgroundColor: COLORS.accent,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.lg,
  },
  btnDisabled: { backgroundColor: COLORS.primaryLight, opacity: 0.6 },
  btnText: { color: '#fff', fontSize: FONT_SIZE.lg, fontWeight: '700', letterSpacing: 0.4 },

  ghostBtn: {
    height: 48, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.borderStrong, paddingHorizontal: SPACING.lg,
  },
  ghostBtnDanger: { borderColor: COLORS.danger + '60' },
  ghostBtnText: { color: COLORS.text, fontSize: FONT_SIZE.base, fontWeight: '600' },
  ghostBtnTextDanger: { color: COLORS.danger },

  // Input
  inputWrap: { marginBottom: SPACING.md },
  inputLabel: {
    color: COLORS.textMuted, fontSize: FONT_SIZE.sm, fontWeight: '700',
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: SPACING.sm,
  },
  inputBox: {
    borderWidth: 1.5, borderRadius: RADIUS.md, backgroundColor: COLORS.cardStrong,
  },
  input: { color: COLORS.text, fontSize: FONT_SIZE.base, paddingHorizontal: SPACING.md, paddingVertical: 13 },
  inputError: { color: COLORS.danger, fontSize: FONT_SIZE.sm, marginTop: 4 },

  // Steps
  stepWrap: { alignItems: 'center', paddingVertical: SPACING.md },
  stepTrack: { flexDirection: 'row', alignItems: 'center' },
  dot: {
    width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.bg2, borderWidth: 1.5, borderColor: COLORS.border,
  },
  dotCur: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  dotDone: { backgroundColor: COLORS.accentDim, borderColor: COLORS.accentDim },
  dotNum: { color: COLORS.textDim, fontSize: 11, fontWeight: '700' },
  dotNumCur: { color: COLORS.primary },
  dotCheck: { color: '#fff', fontSize: 11, fontWeight: '700' },
  line: { flex: 1, height: 2, backgroundColor: COLORS.border, marginHorizontal: 3, maxWidth: 36 },
  lineDone: { backgroundColor: COLORS.accentDim },
  stepLbl: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, marginTop: SPACING.sm, fontWeight: '500' },

  // Card
  card: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md,
  },
  cardGlow: { borderColor: COLORS.accentGlow },

  // Section
  secHead: { marginBottom: SPACING.lg },
  secTitle: { color: COLORS.text, fontSize: FONT_SIZE.xxl, fontWeight: '800', letterSpacing: -0.3 },
  secSub: { color: COLORS.textMuted, fontSize: FONT_SIZE.md, marginTop: 6, lineHeight: 20 },

  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.md },
});
