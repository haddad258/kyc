// src/screens/kyc/LivenessScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions, Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StepProgressBar } from '../../components/ui';
import {
  updateLiveness, incrementLivenessAttempts,
  resetLiveness, selectLiveness, submitKyc, selectIsProcessing,
} from '../../store/kycSlice';
import { LIVENESS_CHALLENGES, createLivenessSession } from '../../services/faceDetectionService';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '../../constants/theme';

const { width: SW } = Dimensions.get('window');
const STEP_LABELS = ['Personal Info', 'ID Capture', 'Face Verify', 'Liveness', 'Result'];
const TOTAL_TIME  = 30; // seconds per attempt

export default function LivenessScreen({ navigation }) {
  const dispatch     = useDispatch();
  const liveness     = useSelector(selectLiveness);
  const isProcessing = useSelector(selectIsProcessing);

  // Phase: 'intro' | 'running' | 'passed' | 'failed' | 'submitting'
  const [phase,      setPhase]      = useState('intro');
  const [timeLeft,   setTimeLeft]   = useState(TOTAL_TIME);
  const [activeIdx,  setActiveIdx]  = useState(0);   // current challenge index
  const [completed,  setCompleted]  = useState([]);  // completed challenge keys
  const [session]    = useState(() => createLivenessSession());

  const timerRef     = useRef(null);
  const progressAnim = useRef(new Animated.Value(1)).current;
  const successAnim  = useRef(new Animated.Value(0)).current;
  const pulseAnim    = useRef(new Animated.Value(1)).current;

  // Pulse the current challenge card
  useEffect(() => {
    if (phase !== 'running') return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.03, duration: 600, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1,    duration: 600, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [phase, activeIdx]);

  // Countdown timer
  useEffect(() => {
    if (phase !== 'running') return;
    Animated.timing(progressAnim, {
      toValue: 0, duration: TOTAL_TIME * 1000, useNativeDriver: false,
    }).start();

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setPhase('failed');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // Start a new attempt
  const startChallenge = () => {
    setPhase('running');
    setTimeLeft(TOTAL_TIME);
    setActiveIdx(0);
    setCompleted([]);
    progressAnim.setValue(1);
  };

  // User taps "Done" for the current challenge (MVP self-report)
  const markDone = useCallback(() => {
    const challenge = LIVENESS_CHALLENGES[activeIdx];
    if (!challenge) return;

    session.markChallenge(challenge.key);
    const newCompleted = [...completed, challenge.key];
    setCompleted(newCompleted);

    // Dispatch to Redux
    dispatch(updateLiveness({ [challenge.key]: true }));

    const nextIdx = activeIdx + 1;
    if (nextIdx >= LIVENESS_CHALLENGES.length) {
      // All challenges done
      clearInterval(timerRef.current);
      dispatch(updateLiveness({
        blinkDetected:  true,
        headTurnLeft:   true,
        headTurnRight:  true,
      }));
      setPhase('passed');
      Animated.spring(successAnim, { toValue: 1, useNativeDriver: true }).start();
    } else {
      setActiveIdx(nextIdx);
    }
  }, [activeIdx, completed, session]);

  const handleRetry = () => {
    dispatch(incrementLivenessAttempts());
    dispatch(resetLiveness());
    if (liveness.attempts >= 2) {
      Alert.alert(
        'Too Many Attempts',
        'You have used all liveness attempts. Your KYC will be submitted for manual review.',
        [{ text: 'OK', onPress: handleSubmitManual }]
      );
      return;
    }
    setPhase('intro');
    setCompleted([]);
    setActiveIdx(0);
    progressAnim.setValue(1);
  };

  const handleSubmitManual = async () => {
    dispatch(updateLiveness({ blinkDetected: false, headTurnLeft: false, headTurnRight: false }));
    setPhase('submitting');
    const result = await dispatch(submitKyc());
    if (submitKyc.fulfilled.match(result)) navigation.navigate('Result');
  };

  const handleSubmit = async () => {
    setPhase('submitting');
    const result = await dispatch(submitKyc());
    if (submitKyc.fulfilled.match(result)) navigation.navigate('Result');
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const timerColor = timeLeft <= 8 ? COLORS.danger : timeLeft <= 15 ? COLORS.warning : COLORS.accent;
  const doneCount  = completed.length;

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.stepWrap}>
            <StepProgressBar currentStep={4} totalSteps={5} labels={STEP_LABELS} />
          </View>

          <View style={styles.introPadding}>
            <View style={styles.introIconWrap}>
              <Text style={styles.introIcon}>👁️</Text>
            </View>
            <Text style={styles.introTitle}>Liveness Check</Text>
            <Text style={styles.introSub}>
              We need to confirm you're a real person. Follow the on-screen prompts within {TOTAL_TIME} seconds.
            </Text>

            <View style={styles.challengePreviewList}>
              {LIVENESS_CHALLENGES.map((c, i) => (
                <View key={c.key} style={styles.challengePreviewRow}>
                  <View style={styles.challengePreviewNum}>
                    <Text style={styles.challengePreviewNumText}>{i + 1}</Text>
                  </View>
                  <View>
                    <Text style={styles.challengePreviewTitle}>{c.title}</Text>
                    <Text style={styles.challengePreviewDetail}>{c.detail}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.privacyBanner}>
              <Text style={styles.privacyBannerText}>
                🔒 This is processed on-device. No video is recorded or stored.
              </Text>
            </View>

            <TouchableOpacity style={styles.startBtn} onPress={startChallenge} activeOpacity={0.88}>
              <Text style={styles.startBtnText}>Start Liveness Check  →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backBtnText}>← Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── RUNNING ────────────────────────────────────────────────────────────────
  if (phase === 'running') {
    const challenge = LIVENESS_CHALLENGES[activeIdx];
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.stepWrap}>
            <StepProgressBar currentStep={4} totalSteps={5} labels={STEP_LABELS} />
          </View>

          {/* Timer bar */}
          <View style={styles.timerBar}>
            <Animated.View style={[styles.timerFill, { width: progressWidth, backgroundColor: timerColor }]} />
          </View>
          <View style={styles.timerRow}>
            <Text style={[styles.timerText, { color: timerColor }]}>{timeLeft}s remaining</Text>
            <Text style={styles.timerSteps}>{doneCount} / {LIVENESS_CHALLENGES.length} done</Text>
          </View>

          {/* Completed chips */}
          <View style={styles.doneChips}>
            {LIVENESS_CHALLENGES.map((c) => {
              const isDone = completed.includes(c.key);
              return (
                <View key={c.key} style={[styles.chip, isDone && styles.chipDone]}>
                  <Text style={[styles.chipText, isDone && styles.chipTextDone]}>
                    {isDone ? '✓ ' : ''}{c.icon}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Active challenge card */}
          <View style={styles.challengePad}>
            <Animated.View style={[styles.challengeCard, { transform: [{ scale: pulseAnim }] }]}>
              <Text style={styles.challengeCardIcon}>{challenge.icon}</Text>
              <Text style={styles.challengeCardTitle}>{challenge.title}</Text>
              <Text style={styles.challengeCardDetail}>{challenge.detail}</Text>

              <TouchableOpacity style={styles.doneBtn} onPress={markDone} activeOpacity={0.85}>
                <Text style={styles.doneBtnText}>✓  Done — Next</Text>
              </TouchableOpacity>
            </Animated.View>

            <Text style={styles.challengeHint}>
              Tap "Done" once you have completed the action above.
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── PASSED ─────────────────────────────────────────────────────────────────
  if (phase === 'passed') {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.stepWrap}>
            <StepProgressBar currentStep={4} totalSteps={5} labels={STEP_LABELS} />
          </View>
          <Animated.View style={[styles.resultWrap, { opacity: successAnim, transform: [{ scale: successAnim }] }]}>
            <Text style={styles.resultIcon}>🎉</Text>
            <Text style={[styles.resultTitle, { color: COLORS.success }]}>Liveness Verified!</Text>
            <Text style={styles.resultSub}>You completed all {LIVENESS_CHALLENGES.length} challenges successfully.</Text>

            <View style={styles.summaryList}>
              {LIVENESS_CHALLENGES.map((c) => (
                <View key={c.key} style={styles.summaryRow}>
                  <Text style={styles.summaryCheck}>✅</Text>
                  <Text style={styles.summaryText}>{c.title}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.startBtn, { backgroundColor: COLORS.success }]}
              onPress={handleSubmit}
              disabled={isProcessing}
              activeOpacity={0.88}
            >
              <Text style={styles.startBtnText}>
                {isProcessing ? 'Submitting KYC…' : 'Submit KYC Application  →'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </View>
    );
  }

  // ── FAILED ─────────────────────────────────────────────────────────────────
  if (phase === 'failed') {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.stepWrap}>
            <StepProgressBar currentStep={4} totalSteps={5} labels={STEP_LABELS} />
          </View>
          <View style={styles.resultWrap}>
            <Text style={styles.resultIcon}>⏰</Text>
            <Text style={[styles.resultTitle, { color: COLORS.danger }]}>Time's Up!</Text>
            <Text style={styles.resultSub}>
              You didn't complete all challenges in time.{'\n'}
              {liveness.attempts < 2
                ? `You have ${2 - liveness.attempts} attempt(s) remaining.`
                : 'No attempts remaining.'}
            </Text>

            {liveness.attempts < 2 ? (
              <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} activeOpacity={0.88}>
                <Text style={styles.retryBtnText}>↩  Try Again</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.manualBtn} onPress={handleSubmitManual} activeOpacity={0.88}>
                <Text style={styles.manualBtnText}>Submit for Manual Review</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.navigate('Dashboard')}
            >
              <Text style={styles.backBtnText}>← Back to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── SUBMITTING ─────────────────────────────────────────────────────────────
  return (
    <View style={[styles.root, styles.submittingWrap]}>
      <Text style={styles.submittingIcon}>⏳</Text>
      <Text style={styles.submittingText}>Submitting your KYC application…</Text>
      <Text style={styles.submittingSubText}>Please wait, this may take a few seconds.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg0 },
  safe: { flex: 1 },
  stepWrap: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm },

  // Intro
  introPadding: { flex: 1, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg, gap: SPACING.lg },
  introIconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.accentGlow, borderWidth: 1.5, borderColor: 'rgba(0,212,170,0.3)',
    alignItems: 'center', justifyContent: 'center', alignSelf: 'center',
  },
  introIcon:  { fontSize: 34 },
  introTitle: { color: COLORS.text, fontSize: FONT_SIZE.xxl, fontWeight: '800', textAlign: 'center' },
  introSub:   { color: COLORS.textMuted, fontSize: FONT_SIZE.md, textAlign: 'center', lineHeight: 22 },

  challengePreviewList: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md, gap: SPACING.md,
  },
  challengePreviewRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  challengePreviewNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.accentGlow, alignItems: 'center', justifyContent: 'center',
  },
  challengePreviewNumText: { color: COLORS.accent, fontWeight: '800', fontSize: FONT_SIZE.sm },
  challengePreviewTitle:  { color: COLORS.text, fontSize: FONT_SIZE.md, fontWeight: '700' },
  challengePreviewDetail: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm },

  privacyBanner: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md,
  },
  privacyBannerText: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, textAlign: 'center' },

  startBtn: {
    height: 56, borderRadius: RADIUS.md, backgroundColor: COLORS.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  startBtnText: { color: '#fff', fontSize: FONT_SIZE.lg, fontWeight: '700' },
  backBtn: { alignItems: 'center', paddingVertical: SPACING.sm },
  backBtnText: { color: COLORS.textMuted, fontSize: FONT_SIZE.md },

  // Timer
  timerBar: { height: 5, backgroundColor: COLORS.border, marginHorizontal: SPACING.lg, borderRadius: 3, marginTop: SPACING.sm },
  timerFill: { height: 5, borderRadius: 3 },
  timerRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, marginTop: 4,
  },
  timerText:  { fontSize: FONT_SIZE.sm, fontWeight: '700' },
  timerSteps: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm },

  doneChips: {
    flexDirection: 'row', justifyContent: 'center',
    gap: SPACING.sm, padding: SPACING.md,
  },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.full,
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.bg2,
  },
  chipDone: { borderColor: COLORS.success, backgroundColor: COLORS.successBg },
  chipText:     { color: COLORS.textDim, fontSize: FONT_SIZE.xl },
  chipTextDone: { color: COLORS.success },

  challengePad: {
    flex: 1, paddingHorizontal: SPACING.lg, justifyContent: 'center', gap: SPACING.lg,
  },
  challengeCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.xl,
    borderWidth: 1.5, borderColor: 'rgba(0,212,170,0.25)',
    padding: SPACING.xl, alignItems: 'center', gap: SPACING.md,
  },
  challengeCardIcon:   { fontSize: 56 },
  challengeCardTitle:  { color: COLORS.text, fontSize: FONT_SIZE.xl, fontWeight: '800', textAlign: 'center' },
  challengeCardDetail: { color: COLORS.textMuted, fontSize: FONT_SIZE.md, textAlign: 'center', lineHeight: 22 },
  doneBtn: {
    width: '100%', height: 50, borderRadius: RADIUS.md, backgroundColor: COLORS.accent,
    alignItems: 'center', justifyContent: 'center', marginTop: SPACING.sm,
  },
  doneBtnText: { color: '#fff', fontSize: FONT_SIZE.lg, fontWeight: '700' },
  challengeHint: {
    color: COLORS.textDim, fontSize: FONT_SIZE.sm, textAlign: 'center', fontStyle: 'italic',
  },

  // Result
  resultWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: SPACING.lg, gap: SPACING.lg,
  },
  resultIcon:  { fontSize: 64 },
  resultTitle: { fontSize: FONT_SIZE.xxl, fontWeight: '800', textAlign: 'center' },
  resultSub:   { color: COLORS.textMuted, fontSize: FONT_SIZE.md, textAlign: 'center', lineHeight: 22 },

  summaryList: {
    width: '100%', backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md, gap: SPACING.sm,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  summaryCheck: { fontSize: 16 },
  summaryText:  { color: COLORS.text, fontSize: FONT_SIZE.md },

  retryBtn: {
    width: '100%', height: 52, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  retryBtnText: { color: COLORS.accent, fontWeight: '700', fontSize: FONT_SIZE.lg },
  manualBtn: {
    width: '100%', height: 52, borderRadius: RADIUS.md,
    backgroundColor: COLORS.warningBg, borderWidth: 1, borderColor: 'rgba(255,184,0,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  manualBtnText: { color: COLORS.warning, fontWeight: '700', fontSize: FONT_SIZE.md },

  // Submitting
  submittingWrap: { justifyContent: 'center', alignItems: 'center', gap: SPACING.md },
  submittingIcon:    { fontSize: 52 },
  submittingText:    { color: COLORS.text, fontSize: FONT_SIZE.lg, fontWeight: '700' },
  submittingSubText: { color: COLORS.textMuted, fontSize: FONT_SIZE.md },
});
