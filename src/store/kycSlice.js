// src/store/kycSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// ─── Submit KYC Thunk ─────────────────────────────────────────────────────────

export const submitKyc = createAsyncThunk(
  'kyc/submit',
  async (_, { getState, rejectWithValue }) => {
    try {
      await delay(2500);
      const { kyc } = getState();
      const { personalInfo, idCapture, faceVerify, liveness } = kyc;

      // Mock face similarity (82-96% when both images present)
      const hasBothImages = faceVerify.selfieUri && idCapture.frontUri;
      const score = hasBothImages
        ? Math.floor(Math.random() * 14) + 82
        : Math.floor(Math.random() * 30) + 40;

      const reasons = [];
      if (!liveness.passed)          reasons.push('Liveness check did not complete successfully.');
      if (score < 75)                reasons.push(`Face similarity score too low (${score}%). Please retake your selfie in better lighting.`);
      if (!personalInfo.fullName)    reasons.push('Personal information is incomplete.');
      if (!idCapture.frontUri)       reasons.push('ID front photo is missing.');

      let status = 'pending';
      if (reasons.length === 0 && score >= 80 && liveness.passed) {
        status = 'approved';
      } else if (reasons.length >= 2 || score < 60) {
        status = 'rejected';
      }

      return {
        score,
        status,
        reasons,
        completedAt:  new Date().toISOString(),
        referenceId:  `KYC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

// ─── Initial State ────────────────────────────────────────────────────────────

const INITIAL = {
  currentStep: 1,

  personalInfo: {
    fullName:    '',
    dob:         '',
    country:     '',
    nationality: '',
  },

  idCapture: {
    frontUri:     null,
    backUri:      null,
    frontEnhanced:null,
    backEnhanced: null,
  },

  faceVerify: {
    selfieUri:    null,
    faceDetected: false,
    faceCount:    0,
  },

  liveness: {
    blinkDetected:  false,
    headTurnLeft:   false,
    headTurnRight:  false,
    smileDetected:  false,
    passed:         false,
    attempts:       0,
  },

  result: {
    score:       null,
    status:      null,   // 'approved' | 'rejected' | 'pending'
    reasons:     [],
    completedAt: null,
    referenceId: null,
  },

  isProcessing: false,
  error:        null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const kycSlice = createSlice({
  name: 'kyc',
  initialState: INITIAL,
  reducers: {
    setStep:         (state, { payload }) => { state.currentStep = payload; },
    nextStep:        (state) => { state.currentStep = Math.min(state.currentStep + 1, 5); },
    prevStep:        (state) => { state.currentStep = Math.max(state.currentStep - 1, 1); },

    setPersonalInfo: (state, { payload }) => {
      state.personalInfo = { ...state.personalInfo, ...payload };
    },

    setIdFront: (state, { payload: { uri, enhanced } }) => {
      state.idCapture.frontUri      = uri;
      state.idCapture.frontEnhanced = enhanced || uri;
    },
    setIdBack: (state, { payload: { uri, enhanced } }) => {
      state.idCapture.backUri      = uri;
      state.idCapture.backEnhanced = enhanced || uri;
    },
    clearIdFront: (state) => {
      state.idCapture.frontUri = null; state.idCapture.frontEnhanced = null;
    },
    clearIdBack: (state) => {
      state.idCapture.backUri = null; state.idCapture.backEnhanced = null;
    },

    setSelfie: (state, { payload }) => {
      state.faceVerify.selfieUri = payload;
    },
    setFaceDetection: (state, { payload: { detected, count } }) => {
      state.faceVerify.faceDetected = detected;
      state.faceVerify.faceCount    = count;
    },

    updateLiveness: (state, { payload }) => {
      state.liveness = { ...state.liveness, ...payload };
      state.liveness.passed =
        state.liveness.blinkDetected &&
        (state.liveness.headTurnLeft || state.liveness.headTurnRight);
    },
    incrementLivenessAttempts: (state) => {
      state.liveness.attempts += 1;
    },
    resetLiveness: (state) => {
      state.liveness = { ...INITIAL.liveness };
    },

    resetKyc: () => INITIAL,
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitKyc.pending, (state) => {
        state.isProcessing = true;
        state.error        = null;
      })
      .addCase(submitKyc.fulfilled, (state, { payload }) => {
        state.isProcessing = false;
        state.result       = payload;
      })
      .addCase(submitKyc.rejected, (state, { payload }) => {
        state.isProcessing = false;
        state.error        = payload;
      });
  },
});

export const {
  setStep, nextStep, prevStep,
  setPersonalInfo,
  setIdFront, setIdBack, clearIdFront, clearIdBack,
  setSelfie, setFaceDetection,
  updateLiveness, incrementLivenessAttempts, resetLiveness,
  resetKyc, clearError,
} = kycSlice.actions;

export default kycSlice.reducer;

// Selectors
export const selectKyc          = (s) => s.kyc;
export const selectPersonalInfo = (s) => s.kyc.personalInfo;
export const selectIdCapture    = (s) => s.kyc.idCapture;
export const selectFaceVerify   = (s) => s.kyc.faceVerify;
export const selectLiveness     = (s) => s.kyc.liveness;
export const selectResult       = (s) => s.kyc.result;
export const selectCurrentStep  = (s) => s.kyc.currentStep;
export const selectIsProcessing = (s) => s.kyc.isProcessing;

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
