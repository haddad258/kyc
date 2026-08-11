// src/store/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const initAuth = createAsyncThunk('auth/init', async () => {
  try {
    const token = await SecureStore.getItemAsync('kyc_session_token');
    const raw   = await SecureStore.getItemAsync('kyc_user_data');
    if (token && raw) {
      return { token, user: JSON.parse(raw) };
    }
  } catch (_) {}
  return null;
});

export const sendOtp = createAsyncThunk('auth/sendOtp', async (contact, { rejectWithValue }) => {
  try {
    await delay(1200);
    // Production: POST /auth/send-otp { contact }
    return { contact };
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ contact, otp }, { rejectWithValue }) => {
    try {
      await delay(1000);
      if (otp.length !== 6) throw new Error('Invalid OTP. Enter 6 digits.');
      // Production: POST /auth/verify-otp { contact, otp }
      const user  = { id: uid(), contact, createdAt: new Date().toISOString() };
      const token = `mvp_token_${uid()}`;
      await SecureStore.setItemAsync('kyc_session_token', token);
      await SecureStore.setItemAsync('kyc_user_data', JSON.stringify(user));
      return { user, token };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await SecureStore.deleteItemAsync('kyc_session_token');
  await SecureStore.deleteItemAsync('kyc_user_data');
});

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:            null,
    token:           null,
    isAuthenticated: false,
    isLoading:       false,
    otpSent:         false,
    error:           null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    resetOtp:   (state) => { state.otpSent = false; },
  },
  extraReducers: (builder) => {
    // initAuth
    builder
      .addCase(initAuth.fulfilled, (state, { payload }) => {
        if (payload) {
          state.user            = payload.user;
          state.token           = payload.token;
          state.isAuthenticated = true;
        }
      })
    // sendOtp
      .addCase(sendOtp.pending,   (state) => { state.isLoading = true; state.error = null; })
      .addCase(sendOtp.fulfilled, (state) => { state.isLoading = false; state.otpSent = true; })
      .addCase(sendOtp.rejected,  (state, { payload }) => { state.isLoading = false; state.error = payload; })
    // verifyOtp
      .addCase(verifyOtp.pending,   (state) => { state.isLoading = true; state.error = null; })
      .addCase(verifyOtp.fulfilled, (state, { payload }) => {
        state.isLoading       = false;
        state.user            = payload.user;
        state.token           = payload.token;
        state.isAuthenticated = true;
      })
      .addCase(verifyOtp.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error     = payload;
      })
    // logout
      .addCase(logout.fulfilled, (state) => {
        state.user            = null;
        state.token           = null;
        state.isAuthenticated = false;
        state.otpSent         = false;
      });
  },
});

export const { clearError, resetOtp } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectAuth    = (s) => s.auth;
export const selectUser    = (s) => s.auth.user;
export const selectIsAuth  = (s) => s.auth.isAuthenticated;

// Helpers
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const uid   = () => Math.random().toString(36).slice(2, 10).toUpperCase();
