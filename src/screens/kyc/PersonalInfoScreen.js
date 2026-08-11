// src/screens/kyc/PersonalInfoScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ScreenLayout from '../../components/common/ScreenLayout';
import { Input, PrimaryButton, StepProgressBar, SectionHeader } from '../../components/ui';
import { setPersonalInfo, selectPersonalInfo } from '../../store/kycSlice';
import { COLORS, SPACING, RADIUS, FONT_SIZE, COUNTRIES } from '../../constants/theme';

const STEP_LABELS = ['Personal Info', 'ID Capture', 'Face Verify', 'Liveness', 'Result'];

export default function PersonalInfoScreen({ navigation }) {
  const dispatch    = useDispatch();
  const savedInfo   = useSelector(selectPersonalInfo);

  const [form, setForm] = useState({
    fullName:    savedInfo.fullName    || '',
    dob:         savedInfo.dob         || '',
    country:     savedInfo.country     || '',
    nationality: savedInfo.nationality || '',
  });
  const [errors,      setErrors]      = useState({});
  const [showCountry, setShowCountry] = useState(false);

  const update = (field, val) => {
    setForm((f) => ({ ...f, [field]: val }));
    setErrors((e) => ({ ...e, [field]: null }));
  };

  const validate = () => {
    const e = {};
    const name = form.fullName.trim();
    if (!name) {
      e.fullName = 'Full name is required';
    } else if (name.split(/\s+/).length < 2) {
      e.fullName = 'Please enter first and last name';
    }

    if (!form.dob.trim()) {
      e.dob = 'Date of birth is required';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.dob)) {
      e.dob = 'Use format YYYY-MM-DD';
    } else {
      const age = new Date().getFullYear() - parseInt(form.dob.slice(0, 4), 10);
      if (age < 18)  e.dob = 'You must be at least 18 years old';
      if (age > 120) e.dob = 'Please enter a valid date of birth';
    }

    if (!form.country) e.country = 'Please select your country';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    dispatch(setPersonalInfo(form));
    navigation.navigate('IdCapture');
  };

  return (
    <ScreenLayout showBack onBack={() => navigation.goBack()}>
      <StepProgressBar currentStep={1} totalSteps={5} labels={STEP_LABELS} />

      <SectionHeader
        title="Personal Information"
        subtitle="Enter your details exactly as they appear on your ID document."
      />

      <Input
        label="Full Name"
        placeholder="e.g. John Michael Doe"
        value={form.fullName}
        onChangeText={(v) => update('fullName', v)}
        autoCapitalize="words"
        error={errors.fullName}
      />

      <Input
        label="Date of Birth"
        placeholder="YYYY-MM-DD"
        value={form.dob}
        onChangeText={(v) => update('dob', v)}
        keyboardType="numbers-and-punctuation"
        error={errors.dob}
      />

      {/* Country picker */}
      <View style={styles.pickerWrap}>
        <Text style={styles.pickerLabel}>Country of Residence</Text>
        <TouchableOpacity
          style={[
            styles.pickerBtn,
            errors.country  && styles.pickerBtnError,
            showCountry && styles.pickerBtnActive,
          ]}
          onPress={() => setShowCountry((s) => !s)}
        >
          <Text style={form.country ? styles.pickerValue : styles.pickerPlaceholder}>
            {form.country || 'Select country…'}
          </Text>
          <Text style={styles.pickerArrow}>{showCountry ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {errors.country ? <Text style={styles.pickerError}>{errors.country}</Text> : null}

        {showCountry && (
          <View style={styles.dropdown}>
            <ScrollView nestedScrollEnabled showsVerticalScrollIndicator style={{ maxHeight: 200 }}>
              {COUNTRIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.dropItem, form.country === c && styles.dropItemActive]}
                  onPress={() => { update('country', c); setShowCountry(false); }}
                >
                  <Text style={[styles.dropItemText, form.country === c && styles.dropItemTextActive]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <Input
        label="Nationality (optional)"
        placeholder="e.g. American, Tunisian"
        value={form.nationality}
        onChangeText={(v) => update('nationality', v)}
        autoCapitalize="words"
      />

      <View style={styles.privacyNote}>
        <Text style={styles.privacyText}>
          🔐 Your information is processed securely and never shared with third parties without consent.
        </Text>
      </View>

      <PrimaryButton title="Continue  →" onPress={handleNext} style={{ marginTop: SPACING.sm }} />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  pickerWrap: { marginBottom: SPACING.md },
  pickerLabel: {
    color: COLORS.textMuted, fontSize: FONT_SIZE.sm, fontWeight: '700',
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: SPACING.sm,
  },
  pickerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md,
    backgroundColor: COLORS.cardStrong, paddingHorizontal: SPACING.md, paddingVertical: 13,
  },
  pickerBtnActive: { borderColor: COLORS.accent },
  pickerBtnError:  { borderColor: COLORS.danger },
  pickerValue:       { color: COLORS.text,    fontSize: FONT_SIZE.base },
  pickerPlaceholder: { color: COLORS.textDim, fontSize: FONT_SIZE.base },
  pickerArrow:       { color: COLORS.textDim, fontSize: 11 },
  pickerError:       { color: COLORS.danger,  fontSize: FONT_SIZE.sm, marginTop: 4 },

  dropdown: {
    marginTop: 4, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, backgroundColor: COLORS.bg2, overflow: 'hidden',
  },
  dropItem: { paddingHorizontal: SPACING.md, paddingVertical: 12 },
  dropItemActive: { backgroundColor: COLORS.accentGlow },
  dropItemText:   { color: COLORS.text, fontSize: FONT_SIZE.md },
  dropItemTextActive: { color: COLORS.accent, fontWeight: '700' },

  privacyNote: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  privacyText: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, lineHeight: 18 },
});
