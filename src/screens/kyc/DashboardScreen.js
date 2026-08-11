// src/screens/kyc/DashboardScreen.js
import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../../store/authSlice';
import { selectResult, selectLiveness, resetKyc } from '../../store/kycSlice';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '../../constants/theme';

const STEPS = [
  { key: 'PersonalInfo', label: 'Personal Info',    icon: '👤', desc: 'Full name, date of birth, country' },
  { key: 'IdCapture',    label: 'ID Document',       icon: '🪪', desc: 'Capture front & back of your ID' },
  { key: 'FaceVerify',   label: 'Face Verification', icon: '🤳', desc: 'Selfie with real-time face check' },
  { key: 'Liveness',     label: 'Liveness Check',    icon: '👁️', desc: 'Blink and head-turn challenge' },
];

export default function DashboardScreen({ navigation }) {
  const dispatch = useDispatch();
  const user     = useSelector(selectUser);
  const result   = useSelector(selectResult);
  const fade     = useRef(new Animated.Value(0)).current;
  const slide    = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const hasResult = !!result.status;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Welcome back 👋</Text>
              <Text style={styles.contact}>{user?.contact}</Text>
            </View>
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => dispatch(logout())}
            >
              <Text style={styles.logoutText}>Sign out</Text>
            </TouchableOpacity>
          </View>

          {/* Status / hero banner */}
          <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
            {hasResult ? (
              <ResultBanner
                result={result}
                onView={() => navigation.navigate('Result')}
                onReset={() => dispatch(resetKyc())}
              />
            ) : (
              <View style={styles.heroBanner}>
                <View style={styles.heroIconWrap}>
                  <Text style={styles.heroIcon}>🛡️</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.heroTitle}>Complete your KYC</Text>
                  <Text style={styles.heroSub}>Verify your identity in under 3 minutes.</Text>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: '5%' }]} />
                  </View>
                  <Text style={styles.progressLabel}>0 / 4 steps completed</Text>
                </View>
              </View>
            )}
          </Animated.View>

          {/* Steps list */}
          <Text style={styles.sectionLabel}>Verification Steps</Text>

          {STEPS.map((step, i) => (
            <Animated.View
              key={step.key}
              style={{ opacity: fade, transform: [{ translateY: slide }] }}
            >
              <TouchableOpacity
                style={styles.stepCard}
                onPress={() => navigation.navigate(step.key)}
                activeOpacity={0.75}
              >
                <View style={styles.stepLeft}>
                  <View style={styles.stepIconBg}>
                    <Text style={styles.stepIcon}>{step.icon}</Text>
                  </View>
                  <View style={styles.stepText}>
                    <Text style={styles.stepLabel}>{step.label}</Text>
                    <Text style={styles.stepDesc}>{step.desc}</Text>
                  </View>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}

          {/* Start CTA */}
          {!hasResult && (
            <Animated.View style={{ opacity: fade }}>
              <TouchableOpacity
                style={styles.startBtn}
                onPress={() => navigation.navigate('PersonalInfo')}
                activeOpacity={0.88}
              >
                <Text style={styles.startBtnText}>Start Verification  →</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function ResultBanner({ result, onView, onReset }) {
  const cfg = {
    approved: { color: COLORS.success, bg: COLORS.successBg, border: 'rgba(0,200,150,0.3)', icon: '✅', label: 'Approved' },
    rejected: { color: COLORS.danger,  bg: COLORS.dangerBg,  border: 'rgba(255,71,87,0.3)', icon: '❌', label: 'Rejected' },
    pending:  { color: COLORS.warning, bg: COLORS.warningBg, border: 'rgba(255,184,0,0.3)', icon: '⏳', label: 'Under Review' },
  }[result.status] || {};

  return (
    <View style={[styles.resultBanner, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <Text style={styles.resultIcon}>{cfg.icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.resultTitle, { color: cfg.color }]}>KYC {cfg.label}</Text>
        <Text style={styles.resultRef}>Ref: {result.referenceId}</Text>
      </View>
      <TouchableOpacity onPress={onView} style={[styles.viewBtn, { borderColor: cfg.color }]}>
        <Text style={[styles.viewBtnText, { color: cfg.color }]}>View</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg0 },
  safe: { flex: 1 },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxxl, gap: SPACING.md },

  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: SPACING.sm,
  },
  greeting: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, marginBottom: 2 },
  contact:  { color: COLORS.text, fontSize: FONT_SIZE.lg, fontWeight: '700' },
  logoutBtn:{
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border,
  },
  logoutText: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, fontWeight: '600' },

  heroBanner: {
    flexDirection: 'row', gap: SPACING.md,
    backgroundColor: COLORS.accentGlow, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.2)', padding: SPACING.md,
  },
  heroIconWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.bg2, alignItems: 'center', justifyContent: 'center',
  },
  heroIcon:  { fontSize: 22 },
  heroTitle: { color: COLORS.text, fontSize: FONT_SIZE.lg, fontWeight: '700', marginBottom: 2 },
  heroSub:   { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, marginBottom: SPACING.sm },
  progressTrack: { height: 4, backgroundColor: COLORS.border, borderRadius: 2, marginBottom: 4 },
  progressFill:  { height: 4, backgroundColor: COLORS.accent, borderRadius: 2 },
  progressLabel: { color: COLORS.textDim, fontSize: FONT_SIZE.xs, fontWeight: '600' },

  sectionLabel: {
    color: COLORS.textMuted, fontSize: FONT_SIZE.xs, fontWeight: '700',
    letterSpacing: 1, textTransform: 'uppercase',
  },

  stepCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.card, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md,
  },
  stepLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: SPACING.md },
  stepIconBg: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.bg2, alignItems: 'center', justifyContent: 'center',
  },
  stepIcon:  { fontSize: 20 },
  stepText:  { flex: 1 },
  stepLabel: { color: COLORS.text, fontSize: FONT_SIZE.base, fontWeight: '700' },
  stepDesc:  { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, marginTop: 2 },
  chevron:   { color: COLORS.textDim, fontSize: 22 },

  startBtn: {
    height: 56, borderRadius: RADIUS.md, backgroundColor: COLORS.accent,
    alignItems: 'center', justifyContent: 'center', marginTop: SPACING.sm,
  },
  startBtnText: { color: '#fff', fontSize: FONT_SIZE.lg, fontWeight: '700', letterSpacing: 0.3 },

  resultBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    borderRadius: RADIUS.lg, borderWidth: 1, padding: SPACING.md,
  },
  resultIcon:  { fontSize: 28 },
  resultTitle: { fontSize: FONT_SIZE.base, fontWeight: '700' },
  resultRef:   { color: COLORS.textDim, fontSize: FONT_SIZE.xs, marginTop: 2 },
  viewBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: RADIUS.full, borderWidth: 1,
  },
  viewBtnText: { fontSize: FONT_SIZE.sm, fontWeight: '700' },
});
