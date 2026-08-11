// src/screens/auth/OtpScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, Animated,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ScreenLayout from '../../components/common/ScreenLayout';
import { PrimaryButton, SectionHeader } from '../../components/ui';
import { verifyOtp, sendOtp, clearError, selectAuth } from '../../store/authSlice';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '../../constants/theme';

const OTP_LEN = 6;

export default function OtpScreen({ navigation, route }) {
  const { contact, mode } = route.params;
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(selectAuth);

  const [otp,    setOtp]    = useState('');
  const [timer,  setTimer]  = useState(30);
  const inputRef = useRef(null);
  const shake    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
    const t = setInterval(() => setTimer((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const runShake = () =>
    Animated.sequence([
      Animated.timing(shake, { toValue: 10,  duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -10, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 6,   duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0,   duration: 55, useNativeDriver: true }),
    ]).start();

  const handleVerify = async () => {
    dispatch(clearError());
    const result = await dispatch(verifyOtp({ contact, otp }));
    if (verifyOtp.rejected.match(result)) {
      runShake();
      setOtp('');
    }
    // On success, RootNavigator auto-switches to KycNavigator via Redux state
  };

  const handleResend = async () => {
    if (timer > 0) return;
    await dispatch(sendOtp(contact));
    setTimer(30);
  };

  // OTP digit boxes
  const boxes = Array.from({ length: OTP_LEN }).map((_, i) => {
    const char   = otp[i] || '';
    const active = i === otp.length;
    return (
      <TouchableOpacity
        key={i}
        style={[styles.box, active && styles.boxActive, char && styles.boxFilled]}
        onPress={() => inputRef.current?.focus()}
        activeOpacity={1}
      >
        <Text style={styles.boxChar}>{char ? '•' : ''}</Text>
        {active && <View style={styles.cursor} />}
      </TouchableOpacity>
    );
  });

  return (
    <ScreenLayout showBack onBack={() => navigation.goBack()}>
      <SectionHeader
        title="Enter Code"
        subtitle={`A 6-digit code was sent to\n${contact}`}
      />

      <Animated.View style={[styles.boxRow, { transform: [{ translateX: shake }] }]}>
        {boxes}
      </Animated.View>

      {/* Hidden real input */}
      <TextInput
        ref={inputRef}
        value={otp}
        onChangeText={(v) => {
          dispatch(clearError());
          setOtp(v.replace(/\D/g, '').slice(0, OTP_LEN));
        }}
        keyboardType="number-pad"
        maxLength={OTP_LEN}
        style={styles.hiddenInput}
        caretHidden
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <PrimaryButton
        title="Verify Code"
        onPress={handleVerify}
        loading={isLoading}
        disabled={otp.length < OTP_LEN}
        style={{ marginTop: SPACING.lg }}
      />

      <View style={styles.resendRow}>
        <Text style={styles.resendLabel}>Didn't receive it? </Text>
        <TouchableOpacity onPress={handleResend} disabled={timer > 0}>
          <Text style={[styles.resendBtn, timer > 0 && styles.resendDisabled]}>
            {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.hintBox}>
        <Text style={styles.hintText}>💡 Demo: enter any 6-digit number to continue</Text>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  boxRow: {
    flexDirection: 'row', justifyContent: 'center',
    gap: 10, marginVertical: SPACING.xl,
  },
  box: {
    width: 48, height: 58, borderRadius: RADIUS.sm,
    borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    alignItems: 'center', justifyContent: 'center',
  },
  boxActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accentGlow },
  boxFilled: { borderColor: COLORS.accentDim },
  boxChar:   { color: COLORS.text, fontSize: 24, fontWeight: '700' },
  cursor: {
    position: 'absolute', bottom: 10, width: 2, height: 20,
    backgroundColor: COLORS.accent, borderRadius: 1,
  },
  hiddenInput: { position: 'absolute', opacity: 0, width: 1, height: 1 },
  errorText: { color: COLORS.danger, textAlign: 'center', fontSize: FONT_SIZE.sm, marginBottom: SPACING.sm },
  resendRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.lg },
  resendLabel:   { color: COLORS.textMuted, fontSize: FONT_SIZE.md },
  resendBtn:     { color: COLORS.accent, fontSize: FONT_SIZE.md, fontWeight: '700' },
  resendDisabled:{ color: COLORS.textDim },
  hintBox: {
    marginTop: SPACING.lg, backgroundColor: COLORS.card,
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border,
    padding: SPACING.md,
  },
  hintText: { color: COLORS.textDim, fontSize: FONT_SIZE.sm, textAlign: 'center', fontStyle: 'italic' },
});
