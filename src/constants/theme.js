// src/constants/theme.js

export const COLORS = {
  // Core palette
  primary:      '#0A1628',
  primaryMid:   '#132040',
  primaryLight: '#1E3A5F',
  accent:       '#00D4AA',
  accentDim:    '#00A888',
  accentGlow:   'rgba(0,212,170,0.15)',
  accentGlow2:  'rgba(0,212,170,0.08)',

  // Status
  success:    '#00C896',
  successBg:  'rgba(0,200,150,0.12)',
  warning:    '#FFB800',
  warningBg:  'rgba(255,184,0,0.12)',
  danger:     '#FF4757',
  dangerBg:   'rgba(255,71,87,0.12)',
  pending:    '#7B68EE',
  pendingBg:  'rgba(123,104,238,0.12)',

  // Neutrals
  white:       '#FFFFFF',
  text:        '#E8EDF5',
  textMuted:   '#8896A8',
  textDim:     '#4A5568',
  border:      'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.04)',
  borderStrong:'rgba(255,255,255,0.15)',
  card:        'rgba(255,255,255,0.04)',
  cardStrong:  'rgba(255,255,255,0.07)',

  // Backgrounds
  bg0: '#060E1A',
  bg1: '#0A1628',
  bg2: '#0F1E38',
  bg3: '#152340',
};

export const SPACING = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  xxl:  48,
  xxxl: 64,
};

export const RADIUS = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  xxl:  32,
  full: 9999,
};

export const FONT_SIZE = {
  xs:  11,
  sm:  12,
  md:  14,
  base:15,
  lg:  17,
  xl:  20,
  xxl: 24,
  xxxl:32,
};

export const KYC_STEPS = [
  { id: 1, key: 'PersonalInfo', label: 'Personal Info',    icon: '👤' },
  { id: 2, key: 'IdCapture',    label: 'ID Capture',       icon: '🪪' },
  { id: 3, key: 'FaceVerify',   label: 'Face Verify',      icon: '🤳' },
  { id: 4, key: 'Liveness',     label: 'Liveness',         icon: '👁️' },
  { id: 5, key: 'Result',       label: 'Result',           icon: '✅' },
];

export const COUNTRIES = [
  'Algeria', 'Australia', 'Bahrain', 'Belgium', 'Brazil', 'Canada',
  'Egypt', 'France', 'Germany', 'India', 'Italy', 'Jordan', 'Kuwait',
  'Lebanon', 'Libya', 'Malaysia', 'Morocco', 'Netherlands', 'Nigeria',
  'Oman', 'Pakistan', 'Qatar', 'Saudi Arabia', 'South Africa', 'Spain',
  'Sweden', 'Switzerland', 'Tunisia', 'Turkey', 'UAE', 'United Kingdom',
  'United States', 'Other',
];
