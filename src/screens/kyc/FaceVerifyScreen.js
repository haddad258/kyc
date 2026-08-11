// src/screens/kyc/FaceVerifyScreen.js
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, Animated, Dimensions, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenLayout from '../../components/common/ScreenLayout';
import { StepProgressBar, PrimaryButton, SectionHeader } from '../../components/ui';
import { setSelfie, setFaceDetection, selectFaceVerify } from '../../store/kycSlice';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '../../constants/theme';

const { width: SW } = Dimensions.get('window');
const STEP_LABELS = ['Personal Info', 'ID Capture', 'Face Verify', 'Liveness', 'Result'];

const TIPS = [
  { icon: '💡', text: 'Good, even lighting — avoid backlighting' },
  { icon: '👤', text: 'Face the camera straight on, no sunglasses' },
  { icon: '📐', text: 'Keep your face centred in the guide oval' },
  { icon: '📷', text: 'Hold still and ensure the photo is sharp' },
];

export default function FaceVerifyScreen({ navigation }) {
  const dispatch      = useDispatch();
  const faceVerify    = useSelector(selectFaceVerify);
  const [loading, setLoading] = useState(false);
  const pulseAnim     = useRef(new Animated.Value(1)).current;

  const startPulse = () =>
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.05, duration: 700, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1,    duration: 700, useNativeDriver: true }),
    ])).start();

  const captureSelfie = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Camera Required', 'Please grant camera access to take your selfie.');
      return;
    }
    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.88,
        cameraType: ImagePicker.CameraType.front, // front-facing
      });
      if (!result.canceled && result.assets?.[0]) {
        const uri = result.assets[0].uri;
        dispatch(setSelfie(uri));
        dispatch(setFaceDetection({ detected: true, count: 1 }));
        startPulse();
      }
    } catch {
      Alert.alert('Error', 'Could not capture selfie. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const retake = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
    dispatch(setSelfie(null));
    dispatch(setFaceDetection({ detected: false, count: 0 }));
  };

  const hasSelfie = !!faceVerify.selfieUri;

  return (
    <ScreenLayout showBack onBack={() => navigation.goBack()}>
      <StepProgressBar currentStep={3} totalSteps={5} labels={STEP_LABELS} />

      <SectionHeader
        title="Face Verification"
        subtitle="Take a clear selfie. We'll match your face to the ID you uploaded."
      />

      {/* Oval frame + preview */}
      <View style={styles.ovalWrap}>
        <Animated.View
          style={[
            styles.ovalRing,
            hasSelfie && { borderColor: COLORS.success },
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          {hasSelfie ? (
            <Image source={{ uri: faceVerify.selfieUri }} style={styles.selfiePreview} />
          ) : (
            <View style={styles.ovalPlaceholder}>
              <Text style={styles.ovalPlaceholderIcon}>👤</Text>
              <Text style={styles.ovalPlaceholderText}>Position your face here</Text>
            </View>
          )}
        </Animated.View>

        {hasSelfie && (
          <View style={styles.capturedPill}>
            <Text style={styles.capturedPillText}>✓  Selfie captured</Text>
          </View>
        )}
      </View>

      {/* Tips */}
      {!hasSelfie && (
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Before you take your selfie:</Text>
          {TIPS.map((t) => (
            <View key={t.text} style={styles.tipRow}>
              <Text style={styles.tipIcon}>{t.icon}</Text>
              <Text style={styles.tipText}>{t.text}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Quality checklist shown after capture */}
      {hasSelfie && (
        <View style={styles.checkCard}>
          <Text style={styles.checkTitle}>Capture Checklist</Text>
          {[
            'Face clearly visible',
            'Eyes open and looking forward',
            'No heavy shadows on face',
            'Background is neutral',
          ].map((item) => (
            <View key={item} style={styles.checkRow}>
              <Text style={styles.checkDot}>✓</Text>
              <Text style={styles.checkText}>{item}</Text>
            </View>
          ))}
          <TouchableOpacity onPress={retake} style={styles.retakeBtn}>
            <Text style={styles.retakeBtnText}>↩  Retake Selfie</Text>
          </TouchableOpacity>
        </View>
      )}

      {!hasSelfie ? (
        <TouchableOpacity style={styles.captureBtn} onPress={captureSelfie} disabled={loading}>
          <Text style={styles.captureBtnIcon}>📸</Text>
          <Text style={styles.captureBtnText}>{loading ? 'Opening Camera…' : 'Take Selfie'}</Text>
        </TouchableOpacity>
      ) : (
        <PrimaryButton
          title="Continue to Liveness Check  →"
          onPress={() => navigation.navigate('Liveness')}
          style={{ marginTop: SPACING.md }}
        />
      )}
    </ScreenLayout>
  );
}

const OVAL_SIZE = SW * 0.62;

const styles = StyleSheet.create({
  ovalWrap: { alignItems: 'center', marginVertical: SPACING.lg, gap: SPACING.md },
  ovalRing: {
    width: OVAL_SIZE, height: OVAL_SIZE * 1.3,
    borderRadius: OVAL_SIZE / 2,
    borderWidth: 3, borderColor: COLORS.border,
    overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.bg2,
  },
  selfiePreview:      { width: '100%', height: '100%' },
  ovalPlaceholder:    { alignItems: 'center', gap: SPACING.sm },
  ovalPlaceholderIcon:{ fontSize: 52, opacity: 0.3 },
  ovalPlaceholderText:{ color: COLORS.textDim, fontSize: FONT_SIZE.sm },

  capturedPill: {
    backgroundColor: COLORS.successBg, borderRadius: RADIUS.full,
    paddingHorizontal: 16, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(0,200,150,0.3)',
  },
  capturedPillText: { color: COLORS.success, fontSize: FONT_SIZE.sm, fontWeight: '700' },

  tipsCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border,
    padding: SPACING.md, gap: SPACING.sm, marginBottom: SPACING.md,
  },
  tipsTitle: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, fontWeight: '700', marginBottom: 4 },
  tipRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  tipIcon: { fontSize: 15 },
  tipText: { color: COLORS.text, fontSize: FONT_SIZE.sm, flex: 1, lineHeight: 18 },

  checkCard: {
    backgroundColor: COLORS.successBg, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: 'rgba(0,200,150,0.2)',
    padding: SPACING.md, gap: SPACING.sm, marginBottom: SPACING.md,
  },
  checkTitle: { color: COLORS.success, fontSize: FONT_SIZE.sm, fontWeight: '700', marginBottom: 4 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  checkDot: { color: COLORS.success, fontWeight: '700' },
  checkText: { color: COLORS.text, fontSize: FONT_SIZE.sm },
  retakeBtn: {
    alignSelf: 'flex-start', marginTop: SPACING.sm,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.borderStrong,
  },
  retakeBtnText: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, fontWeight: '600' },

  captureBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.sm, height: 56, borderRadius: RADIUS.md,
    backgroundColor: COLORS.accent, marginTop: SPACING.md,
  },
  captureBtnIcon: { fontSize: 20 },
  captureBtnText: { color: '#fff', fontSize: FONT_SIZE.lg, fontWeight: '700' },
});
