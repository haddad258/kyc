// src/screens/kyc/IdCaptureScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import ScreenLayout from '../../components/common/ScreenLayout';
import { PrimaryButton, StepProgressBar, SectionHeader } from '../../components/ui';
import {
  setIdFront, setIdBack, clearIdFront, clearIdBack,
  selectIdCapture,
} from '../../store/kycSlice';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '../../constants/theme';

const STEP_LABELS = ['Personal Info', 'ID Capture', 'Face Verify', 'Liveness', 'Result'];

// Crop aspect ratio for an ID-1 card (ISO/IEC 7810)
const ID_ASPECT = [856, 540];

export default function IdCaptureScreen({ navigation }) {
  const dispatch   = useDispatch();
  const idCapture  = useSelector(selectIdCapture);
  const [busy, setBusy] = useState({ front: false, back: false });

  const requestCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  };

  const requestGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  };

  const launchCamera = async (side) => {
    if (!(await requestCamera())) {
      Alert.alert('Permission Required', 'Camera access is needed to capture your ID.');
      return;
    }
    setBusy((b) => ({ ...b, [side]: true }));
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: ID_ASPECT,
        quality: 0.88,
      });
      if (!result.canceled && result.assets?.[0]) {
        const uri = result.assets[0].uri;
        if (side === 'front') dispatch(setIdFront({ uri, enhanced: uri }));
        else                  dispatch(setIdBack ({ uri, enhanced: uri }));
      }
    } catch {
      Alert.alert('Error', 'Could not open camera. Please try again.');
    } finally {
      setBusy((b) => ({ ...b, [side]: false }));
    }
  };

  const launchGallery = async (side) => {
    if (!(await requestGallery())) {
      Alert.alert('Permission Required', 'Photo library access is needed.');
      return;
    }
    setBusy((b) => ({ ...b, [side]: true }));
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: ID_ASPECT,
        quality: 0.88,
      });
      if (!result.canceled && result.assets?.[0]) {
        const uri = result.assets[0].uri;
        if (side === 'front') dispatch(setIdFront({ uri, enhanced: uri }));
        else                  dispatch(setIdBack ({ uri, enhanced: uri }));
      }
    } catch {
      Alert.alert('Error', 'Could not open photo library. Please try again.');
    } finally {
      setBusy((b) => ({ ...b, [side]: false }));
    }
  };

  const bothCaptured = idCapture.frontUri && idCapture.backUri;

  return (
    <ScreenLayout showBack onBack={() => navigation.goBack()}>
      <StepProgressBar currentStep={2} totalSteps={5} labels={STEP_LABELS} />

      <SectionHeader
        title="ID Document"
        subtitle="Capture a clear photo of your government-issued ID card."
      />

      {/* Tips row */}
      <View style={styles.tipsRow}>
        {['Good lighting', 'No glare / blur', 'All 4 corners'].map((t) => (
          <View key={t} style={styles.tip}>
            <Text style={styles.tipCheck}>✓</Text>
            <Text style={styles.tipText}>{t}</Text>
          </View>
        ))}
      </View>

      {/* Front side */}
      <SideCard
        label="Front of ID"
        desc="National ID, Passport, or Driver's Licence"
        uri={idCapture.frontUri}
        loading={busy.front}
        onCamera={() => launchCamera('front')}
        onGallery={() => launchGallery('front')}
        onRetake={() => dispatch(clearIdFront())}
      />

      {/* Back side */}
      <SideCard
        label="Back of ID"
        desc="Reverse side of your ID document"
        uri={idCapture.backUri}
        loading={busy.back}
        onCamera={() => launchCamera('back')}
        onGallery={() => launchGallery('back')}
        onRetake={() => dispatch(clearIdBack())}
      />

      <PrimaryButton
        title="Continue to Face Verification  →"
        onPress={() => navigation.navigate('FaceVerify')}
        disabled={!bothCaptured}
        style={{ marginTop: SPACING.lg }}
      />
      {!bothCaptured && (
        <Text style={styles.hint}>Capture both sides to continue.</Text>
      )}
    </ScreenLayout>
  );
}

function SideCard({ label, desc, uri, loading, onCamera, onGallery, onRetake }) {
  return (
    <View style={styles.sideCard}>
      <Text style={styles.sideLabel}>{label}</Text>
      <Text style={styles.sideDesc}>{desc}</Text>

      {uri ? (
        <View>
          <Image source={{ uri }} style={styles.preview} resizeMode="cover" />
          <View style={styles.capturedBadge}><Text style={styles.capturedText}>✓  Captured</Text></View>
          <TouchableOpacity onPress={onRetake} style={styles.retakeBtn}>
            <Text style={styles.retakeText}>↩  Retake Photo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderIcon}>🪪</Text>
          <Text style={styles.placeholderText}>
            {loading ? 'Processing…' : 'No photo yet'}
          </Text>
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.camBtn} onPress={onCamera} disabled={loading}>
              <Text style={styles.camBtnText}>📷  Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.galBtn} onPress={onGallery} disabled={loading}>
              <Text style={styles.galBtnText}>🖼  Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tipsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  tip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.card, borderRadius: RADIUS.sm,
    padding: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  tipCheck: { color: COLORS.accent, fontSize: 10, fontWeight: '800' },
  tipText:  { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, flex: 1 },

  sideCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border,
    padding: SPACING.md, marginBottom: SPACING.md,
  },
  sideLabel: { color: COLORS.text, fontSize: FONT_SIZE.lg, fontWeight: '700', marginBottom: 2 },
  sideDesc:  { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, marginBottom: SPACING.md },

  placeholder: {
    height: 150, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.border, borderStyle: 'dashed',
    backgroundColor: COLORS.bg2,
    alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
  },
  placeholderIcon: { fontSize: 28 },
  placeholderText: { color: COLORS.textDim, fontSize: FONT_SIZE.sm },
  btnRow: { flexDirection: 'row', gap: SPACING.sm },
  camBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: RADIUS.md, backgroundColor: COLORS.accent,
  },
  camBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: FONT_SIZE.sm },
  galBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.borderStrong,
  },
  galBtnText: { color: COLORS.text, fontWeight: '600', fontSize: FONT_SIZE.sm },

  preview: { width: '100%', height: 150, borderRadius: RADIUS.md },
  capturedBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: COLORS.success, borderRadius: RADIUS.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  capturedText: { color: '#fff', fontSize: FONT_SIZE.xs, fontWeight: '700' },
  retakeBtn: {
    alignSelf: 'center', marginTop: SPACING.sm,
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.borderStrong,
  },
  retakeText: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, fontWeight: '600' },

  hint: {
    color: COLORS.textDim, fontSize: FONT_SIZE.sm,
    textAlign: 'center', marginTop: SPACING.sm,
  },
});
