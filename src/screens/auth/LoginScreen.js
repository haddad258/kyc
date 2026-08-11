// src/screens/auth/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ScreenLayout from '../../components/common/ScreenLayout';
import { Input, PrimaryButton, SectionHeader, Divider } from '../../components/ui';
import { sendOtp, clearError, selectAuth } from '../../store/authSlice';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '../../constants/theme';

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(selectAuth);

  const [mode,    setMode]    = useState('phone');
  const [contact, setContact] = useState('');
  const [errors,  setErrors]  = useState({});

  const validate = () => {
    const e = {};
    if (!contact.trim()) {
      e.contact = 'This field is required';
    } else if (mode === 'phone' && !/^\+?[\d\s\-()\\.]{7,}$/.test(contact)) {
      e.contact = 'Enter a valid phone number';
    } else if (mode === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) {
      e.contact = 'Enter a valid email address';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSend = async () => {
    if (!validate()) return;
    const result = await dispatch(sendOtp(contact.trim()));
    if (sendOtp.fulfilled.match(result)) {
      navigation.navigate('Otp', { contact: contact.trim(), mode });
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setContact('');
    setErrors({});
    dispatch(clearError());
  };

  return (
    <ScreenLayout showBack onBack={() => navigation.goBack()}>
      {/* Privacy notice */}
      <View style={styles.notice}>
        <Text style={styles.noticeIcon}>🔒</Text>
        <Text style={styles.noticeText}>
          Your data is encrypted end-to-end and used only for identity verification.
        </Text>
      </View>

      <SectionHeader
        title="Sign In"
        subtitle="Enter your contact details to receive a one-time verification code."
      />

      {/* Mode toggle */}
      <View style={styles.toggle}>
        {[['phone', '📱  Phone'], ['email', '✉️  Email']].map(([m, label]) => (
          <TouchableOpacity
            key={m}
            style={[styles.toggleTab, mode === m && styles.toggleTabActive]}
            onPress={() => switchMode(m)}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleText, mode === m && styles.toggleTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Input
        label={mode === 'phone' ? 'Phone Number' : 'Email Address'}
        placeholder={mode === 'phone' ? '+1 555 000 0000' : 'you@example.com'}
        value={contact}
        onChangeText={(v) => { setContact(v); setErrors({}); dispatch(clearError()); }}
        keyboardType={mode === 'phone' ? 'phone-pad' : 'email-address'}
        autoCapitalize="none"
        autoCorrect={false}
        error={errors.contact || error}
      />

      <PrimaryButton
        title="Send Code"
        onPress={handleSend}
        loading={isLoading}
        disabled={!contact.trim()}
      />

      <Divider style={{ marginTop: SPACING.xl }} />

      <View style={styles.demoBox}>
        <Text style={styles.demoTitle}>🧪 Demo Mode</Text>
        <Text style={styles.demoText}>Any phone or email works. Use any 6-digit OTP code.</Text>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  notice: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm,
    backgroundColor: COLORS.accentGlow, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.2)',
    padding: SPACING.md, marginBottom: SPACING.xl,
  },
  noticeIcon: { fontSize: 16, marginTop: 1 },
  noticeText: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, flex: 1, lineHeight: 18 },

  toggle: {
    flexDirection: 'row', backgroundColor: COLORS.bg2, borderRadius: RADIUS.md,
    padding: 4, marginBottom: SPACING.lg, gap: 4,
  },
  toggleTab: {
    flex: 1, paddingVertical: 10, borderRadius: RADIUS.sm, alignItems: 'center',
  },
  toggleTabActive: { backgroundColor: COLORS.primaryLight },
  toggleText:      { color: COLORS.textDim, fontWeight: '600', fontSize: FONT_SIZE.md },
  toggleTextActive:{ color: COLORS.accent },

  demoBox: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md,
  },
  demoTitle: { color: COLORS.warning, fontSize: FONT_SIZE.sm, fontWeight: '700', marginBottom: 4 },
  demoText:  { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, lineHeight: 18 },
});
