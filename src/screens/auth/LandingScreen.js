// src/screens/auth/LandingScreen.js
import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '../../constants/theme';

const { width: SW } = Dimensions.get('window');

export default function LandingScreen({ navigation }) {
  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(36)).current;
  const orb1  = useRef(new Animated.Value(0)).current;
  const orb2  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 800, delay: 200, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 800, delay: 200, useNativeDriver: true }),
    ]).start();

    Animated.loop(Animated.sequence([
      Animated.timing(orb1, { toValue: 1, duration: 4200, useNativeDriver: true }),
      Animated.timing(orb1, { toValue: 0, duration: 4200, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.delay(2000),
      Animated.timing(orb2, { toValue: 1, duration: 3600, useNativeDriver: true }),
      Animated.timing(orb2, { toValue: 0, duration: 3600, useNativeDriver: true }),
    ])).start();
  }, []);

  const o1y = orb1.interpolate({ inputRange: [0, 1], outputRange: [0, -22] });
  const o2y = orb2.interpolate({ inputRange: [0, 1], outputRange: [0,  22] });

  return (
    <View style={styles.root}>
      {/* Ambient orbs */}
      <Animated.View style={[styles.orb1, { transform: [{ translateY: o1y }] }]} />
      <Animated.View style={[styles.orb2, { transform: [{ translateY: o2y }] }]} />

      <SafeAreaView style={styles.safe}>
        <View style={styles.inner}>

          {/* Logo */}
          <Animated.View style={[styles.logoWrap, { opacity: fade }]}>
            <View style={styles.logoRing}>
              <View style={styles.logoInner}>
                <Text style={styles.logoIcon}>🪪</Text>
              </View>
            </View>
          </Animated.View>

          {/* Title block */}
          <Animated.View style={[styles.titleBlock, { opacity: fade, transform: [{ translateY: slide }] }]}>
            <Text style={styles.brand}>VerifyMe</Text>
            <Text style={styles.tagline}>
              Secure identity verification{'\n'}in minutes, not days.
            </Text>
          </Animated.View>

          {/* Feature pills */}
          <Animated.View style={[styles.pillsRow, { opacity: fade }]}>
            {['🤳 Face Match', '🔒 Encrypted', '⚡ Instant'].map((p) => (
              <View key={p} style={styles.pill}>
                <Text style={styles.pillText}>{p}</Text>
              </View>
            ))}
          </Animated.View>

          {/* Steps preview */}
          <Animated.View style={[styles.stepsCard, { opacity: fade, transform: [{ translateY: slide }] }]}>
            {[
              ['01', 'Personal Info', 'Name, DOB, country'],
              ['02', 'ID Capture',   'Photo front & back'],
              ['03', 'Face Verify',  'Selfie + matching'],
              ['04', 'Liveness',     'Blink & head turn'],
            ].map(([n, t, s]) => (
              <View key={n} style={styles.stepRow}>
                <View style={styles.stepNum}><Text style={styles.stepNumTxt}>{n}</Text></View>
                <View>
                  <Text style={styles.stepTitle}>{t}</Text>
                  <Text style={styles.stepSub}>{s}</Text>
                </View>
              </View>
            ))}
          </Animated.View>

          {/* CTA */}
          <Animated.View style={[styles.ctaWrap, { opacity: fade, transform: [{ translateY: slide }] }]}>
            <TouchableOpacity
              style={styles.cta}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.88}
            >
              <Text style={styles.ctaText}>Get Verified  →</Text>
            </TouchableOpacity>
            <Text style={styles.disclaimer}>
              By continuing you agree to our Terms of Service and Privacy Policy.
            </Text>
          </Animated.View>

        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg0 },
  safe: { flex: 1 },
  inner: {
    flex: 1, paddingHorizontal: SPACING.lg,
    justifyContent: 'center', gap: SPACING.xl,
  },

  orb1: {
    position: 'absolute', top: -60, right: -60,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: 'rgba(0,212,170,0.07)',
  },
  orb2: {
    position: 'absolute', bottom: 40, left: -80,
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: 'rgba(0,168,136,0.05)',
  },

  logoWrap: { alignItems: 'center' },
  logoRing: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: COLORS.accent,
    alignItems: 'center', justifyContent: 'center', padding: 3,
  },
  logoInner: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: COLORS.bg0,
    alignItems: 'center', justifyContent: 'center',
  },
  logoIcon: { fontSize: 38 },

  titleBlock: { alignItems: 'center' },
  brand: {
    color: COLORS.text, fontSize: 40, fontWeight: '800',
    letterSpacing: -1.5,
  },
  tagline: {
    color: COLORS.textMuted, fontSize: FONT_SIZE.lg,
    textAlign: 'center', lineHeight: 26, marginTop: 8,
  },

  pillsRow: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.sm },
  pill: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: RADIUS.full,
    borderWidth: 1, borderColor: COLORS.borderStrong, backgroundColor: COLORS.card,
  },
  pillText: { color: COLORS.text, fontSize: FONT_SIZE.sm, fontWeight: '600' },

  stepsCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md, gap: SPACING.md,
  },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  stepNum: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.accentGlow, borderWidth: 1, borderColor: COLORS.accentGlow2,
    alignItems: 'center', justifyContent: 'center',
  },
  stepNumTxt: { color: COLORS.accent, fontSize: FONT_SIZE.xs, fontWeight: '800' },
  stepTitle: { color: COLORS.text, fontSize: FONT_SIZE.md, fontWeight: '700' },
  stepSub: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm },

  ctaWrap: { gap: SPACING.md },
  cta: {
    height: 56, borderRadius: RADIUS.md, backgroundColor: COLORS.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  ctaText: { color: '#fff', fontSize: FONT_SIZE.lg, fontWeight: '700', letterSpacing: 0.3 },
  disclaimer: {
    color: COLORS.textDim, fontSize: FONT_SIZE.xs, textAlign: 'center', lineHeight: 16,
  },
});
