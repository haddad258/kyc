// src/services/apiService.js
import axios from 'axios';

/**
 * API Service
 * ─────────────────────────────────────────────────────────
 * MVP: All thunks mock their responses locally.
 * To switch to real backend, set BASE_URL and remove the
 * mock logic from authSlice / kycSlice thunks.
 * ─────────────────────────────────────────────────────────
 */

export const BASE_URL = 'https://api.your-kyc-backend.com/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth token to every request
api.interceptors.request.use(async (config) => {
  // const token = await SecureStore.getItemAsync('kyc_session_token');
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalize error messages
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      err.message ||
      'Network error. Please try again.';
    return Promise.reject(new Error(msg));
  }
);

// ─── Auth ─────────────────────────────────────────────────
export const authApi = {
  sendOtp:   (contact)       => api.post('/auth/send-otp',   { contact }),
  verifyOtp: (contact, otp)  => api.post('/auth/verify-otp', { contact, otp }),
};

// ─── KYC ──────────────────────────────────────────────────
export const kycApi = {
  uploadId: (frontUri, backUri) => {
    const form = new FormData();
    form.append('front', { uri: frontUri, type: 'image/jpeg', name: 'id_front.jpg' });
    form.append('back',  { uri: backUri,  type: 'image/jpeg', name: 'id_back.jpg'  });
    return api.post('/kyc/upload-id', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  matchFaces: (selfieUri, idFrontUri) => {
    const form = new FormData();
    form.append('selfie',   { uri: selfieUri,   type: 'image/jpeg', name: 'selfie.jpg'    });
    form.append('id_photo', { uri: idFrontUri,  type: 'image/jpeg', name: 'id_front.jpg'  });
    return api.post('/kyc/match-faces', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    // Returns: { score: 92, verdict: "match", distance: 0.12 }
  },

  submit:    (payload)        => api.post('/kyc/submit', payload),
  getStatus: (referenceId)    => api.get(`/kyc/status/${referenceId}`),
};

export default api;
