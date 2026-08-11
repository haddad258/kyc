// src/screens/result/ResultScreen.js
import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Animated,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { logout } from '../../store/authSlice';
import {
  selectResult, selectPersonalInfo, selectLiveness,
  selectFaceVerify, selectIdCapture, resetKyc,
} from '../../store/kycSlice';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '../../constants/theme';

const STATUS_CFG = {
  approved: {
    icon: '✅', label: 'Identity Verified!',
    sub: 'Your KYC is approved. You now have full access.',
    color: COLORS.success, bg: 'rgba(0,200,150,0.12)', border: 'rgba(0,200,150,0.3)',
  },
  rejected: {
    icon: '❌', label: 'Verification Failed',
    sub: 'Your KYC could not be verified. Please review the reasons below and try again.',
    color: COLORS.danger, bg: 'rgba(255,71,87,0.12)', border: 'rgba(255,71,87,0.3)',
  },
  pending: {
    icon: '⏳', label: 'Under Manual Review',
    sub: 'Your application is being reviewed by our compliance team. This usually takes 1–2 business days.',
    color: COLORS.warning, bg: 'rgba(255,184,0,0.12)', border: 'rgba(255,184,0,0.3)',
  },
};

export default function ResultScreen({ navigation }) {
  const dispatch     = useDispatch();
  const result       = useSelector(selectResult);
  const personalInfo = useSelector(selectPersonalInfo);
  const liveness     = useSelector(selectLiveness);
  const faceVerify   = useSelector(selectFaceVerify);
  const idCapture    = useSelector(selectIdCapture);

  const fade    = useRef(new Animated.Value(0)).current;
  const scaleIn = useRef(new Animated.Value(0.88)).current;
  const slide   = useRef(new Animated.Value(32)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,    { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(scaleIn, { toValue: 1, tension: 55, friction: 8, useNativeDriver: true }),
      Animated.timing(slide,   { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const cfg = STATUS_CFG[result.status] || STATUS_CFG.pending;

  const formattedDate = result.completedAt
    ? new Date(result.completedAt).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—';

  const handleRetry = () => {
    dispatch(resetKyc());
    navigation.navigate('Dashboard');
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* Back link */}
          <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={styles.backRow}>
            <Text style={styles.backText}>← Dashboard</Text>
          </TouchableOpacity>

          {/* Hero card */}
          <Animated.View
            style={[
              styles.heroCard,
              { backgroundColor: cfg.bg, borderColor: cfg.border },
              { opacity: fade, transform: [{ scale: scaleIn }] },
            ]}
          >
            <Text style={styles.heroIcon}>{cfg.icon}</Text>
            <Text style={[styles.heroTitle, { color: cfg.color }]}>{cfg.label}</Text>
            <Text style={styles.heroSub}>{cfg.sub}</Text>

            {result.score !== null && (
              <View style={[styles.scoreRing, { borderColor: cfg.color }]}>
                <Text style={[styles.scoreNum, { color: cfg.color }]}>{result.score}%</Text>
                <Text style={styles.scoreLabel}>Face Match</Text>
              </View>
            )}
          </Animated.View>

          {/* Reference info */}
          <Animated.View style={[styles.card, { opacity: fade, transform: [{ translateY: slide }] }]}>
            <Text style={styles.cardTitle}>Application Details</Text>
            <InfoRow label="Reference ID"  value={result.referenceId || '—'} mono />
            <InfoRow label="Submitted"     value={formattedDate} />
            <InfoRow label="Applicant"     value={personalInfo.fullName || '—'} />
            <InfoRow label="Country"       value={personalInfo.country  || '—'} />
            <InfoRow label="Date of Birth" value={personalInfo.dob      || '—'} />
          </Animated.View>

          {/* Checklist */}
          <Animated.View style={[styles.card, { opacity: fade, transform: [{ translateY: slide }] }]}>
            <Text style={styles.cardTitle}>Verification Checklist</Text>
            <CheckRow label="Personal information complete" ok={!!personalInfo.fullName && !!personalInfo.dob && !!personalInfo.country} />
            <CheckRow label="ID front photo captured"       ok={!!idCapture.frontUri} />
            <CheckRow label="ID back photo captured"        ok={!!idCapture.backUri} />
            <CheckRow label="Selfie captured"               ok={!!faceVerify.selfieUri} />
            <CheckRow label="Liveness — Blink detected"     ok={liveness.blinkDetected} />
            <CheckRow label="Liveness — Head turn detected" ok={liveness.headTurnLeft || liveness.headTurnRight} />
            <CheckRow label="Face match score ≥ 75%"        ok={(result.score ?? 0) >= 75} />
          </Animated.View>

          {/* Rejection reasons */}
          {result.status === 'rejected' && result.reasons?.length > 0 && (
            <Animated.View style={[styles.reasonsCard, { opacity: fade }]}>
              <Text style={styles.reasonsTitle}>⚠️  Reasons for Rejection</Text>
              {result.reasons.map((r, i) => (
                <View key={i} style={styles.reasonRow}>
                  <Text style={styles.reasonBullet}>•</Text>
                  <Text style={styles.reasonText}>{r}</Text>
                </View>
              ))}
            </Animated.View>
          )}

          {/* Next steps for pending */}
          {result.status === 'pending' && (
            <Animated.View style={[styles.pendingCard, { opacity: fade }]}>
              <Text style={styles.pendingTitle}>📋  What happens next?</Text>
              {[
                'Our team will review your documents within 1–2 business days.',
                'You will receive a notification when your review is complete.',
                'Keep your reference ID for your records.',
              ].map((step, i) => (
                <View key={i} style={styles.pendingRow}>
                  <Text style={styles.pendingBullet}>{i + 1}.</Text>
                  <Text style={styles.pendingText}>{step}</Text>
                </View>
              ))}
            </Animated.View>
          )}

          {/* Actions */}
          <Animated.View style={[styles.actions, { opacity: fade }]}>
            {result.status === 'rejected' && (
              <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} activeOpacity={0.88}>
                <Text style={styles.retryBtnText}>↩  Retry Verification</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => dispatch(logout())}
            >
              <Text style={styles.logoutBtnText}>Sign Out</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function InfoRow({ label, value, mono }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, mono && styles.mono]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function CheckRow({ label, ok }) {
  return (
    <View style={styles.checkRow}>
      <Text style={[styles.checkIcon, { color: ok ? COLORS.success : COLORS.danger }]}>
        {ok ? '✓' : '✗'}
      </Text>
      <Text style={[styles.checkLabel, { color: ok ? COLORS.text : COLORS.textMuted }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg0 },
  safe: { flex: 1 },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxxl, gap: SPACING.md },

  backRow: { marginBottom: SPACING.sm },
  backText: { color: COLORS.accent, fontSize: FONT_SIZE.md, fontWeight: '600' },

  // Hero
  heroCard: {
    borderRadius: RADIUS.xl, borderWidth: 1,
    padding: SPACING.xl, alignItems: 'center', gap: SPACING.sm,
  },
  heroIcon:  { fontSize: 60 },
  heroTitle: { fontSize: FONT_SIZE.xxl, fontWeight: '800', textAlign: 'center', letterSpacing: -0.4 },
  heroSub:   { color: COLORS.textMuted, fontSize: FONT_SIZE.md, textAlign: 'center', lineHeight: 22 },
  scoreRing: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 3, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)', marginTop: SPACING.sm,
  },
  scoreNum:   { fontSize: FONT_SIZE.xxl, fontWeight: '800' },
  scoreLabel: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, fontWeight: '600' },

  // Cards
  card: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md,
  },
  cardTitle: {
    color: COLORS.text, fontSize: FONT_SIZE.md, fontWeight: '700',
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  infoLabel: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, fontWeight: '600', flex: 1 },
  infoValue: { color: COLORS.text, fontSize: FONT_SIZE.sm, fontWeight: '500', maxWidth: '55%', textAlign: 'right' },
  mono:      { fontFamily: 'monospace', letterSpacing: 0.5, fontSize: FONT_SIZE.xs },
  checkRow:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: 5 },
  checkIcon: { fontSize: 15, fontWeight: '800', width: 18 },
  checkLabel:{ fontSize: FONT_SIZE.sm },

  // Reasons
  reasonsCard: {
    backgroundColor: COLORS.dangerBg, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: 'rgba(255,71,87,0.3)', padding: SPACING.md, gap: SPACING.sm,
  },
  reasonsTitle: { color: COLORS.danger, fontSize: FONT_SIZE.md, fontWeight: '700', marginBottom: 4 },
  reasonRow:    { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  reasonBullet: { color: COLORS.danger, fontSize: FONT_SIZE.lg, marginTop: -2 },
  reasonText:   { color: COLORS.text, fontSize: FONT_SIZE.sm, flex: 1, lineHeight: 20 },

  // Pending
  pendingCard: {
    backgroundColor: COLORS.warningBg, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: 'rgba(255,184,0,0.3)', padding: SPACING.md, gap: SPACING.sm,
  },
  pendingTitle: { color: COLORS.warning, fontSize: FONT_SIZE.md, fontWeight: '700', marginBottom: 4 },
  pendingRow:   { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  pendingBullet:{ color: COLORS.warning, fontWeight: '700', fontSize: FONT_SIZE.sm },
  pendingText:  { color: COLORS.text, fontSize: FONT_SIZE.sm, flex: 1, lineHeight: 20 },

  // Actions
  actions: { gap: SPACING.sm, marginTop: SPACING.sm },
  retryBtn: {
    height: 54, borderRadius: RADIUS.md, backgroundColor: COLORS.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  retryBtnText: { color: '#fff', fontSize: FONT_SIZE.lg, fontWeight: '700' },
  logoutBtn: {
    height: 48, borderRadius: RADIUS.md, borderWidth: 1,
    borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center',
  },
  logoutBtnText: { color: COLORS.textMuted, fontWeight: '600', fontSize: FONT_SIZE.md },
});
