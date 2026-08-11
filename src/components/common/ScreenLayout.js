// src/components/common/ScreenLayout.js
import React from 'react';
import {
  View, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform,
  TouchableOpacity, Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../../constants/theme';

export default function ScreenLayout({
  children,
  scrollable = true,
  onBack,
  showBack = false,
  style,
  contentStyle,
  edges = ['top', 'bottom'],
}) {
  return (
    <View style={[styles.root, style]}>
      <SafeAreaView style={styles.safe} edges={edges}>
        {showBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        )}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kav}
        >
          {scrollable ? (
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={[styles.content, contentStyle]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          ) : (
            <View style={[styles.scroll, contentStyle]}>{children}</View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg0 },
  safe: { flex: 1 },
  kav:  { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  backBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, gap: 6,
  },
  backArrow: { color: COLORS.accent, fontSize: 20 },
  backText:  { color: COLORS.accent, fontSize: 15, fontWeight: '600' },
});
