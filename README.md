# VerifyMe KYC — React Native / Expo MVP

A complete KYC (Know Your Customer) mobile application built with
**Expo SDK 54**, **Redux Toolkit**, and **React Navigation 6** (native-stack).

---

## 📁 Project Structure

```
verifyme-kyc/
├── App.js                              ← Entry point — Provider + Navigation
├── app.json                            ← Expo config + permissions
├── babel.config.js                     ← Babel + module-resolver aliases
├── package.json
│
├── src/
│   ├── constants/theme.js              ← Colors, spacing, radii, font sizes
│   │
│   ├── store/
│   │   ├── index.js                    ← configureStore (Redux Toolkit)
│   │   ├── authSlice.js                ← Auth state + async thunks
│   │   └── kycSlice.js                 ← KYC session state + submitKyc thunk
│   │
│   ├── navigation/
│   │   ├── RootNavigator.js            ← Auth guard
│   │   ├── AuthNavigator.js            ← Landing → Login → OTP
│   │   └── KycNavigator.js             ← Dashboard → 4 steps → Result
│   │
│   ├── services/
│   │   ├── faceDetectionService.js     ← Liveness session, face quality helpers
│   │   └── apiService.js               ← Axios client (swap mock → real)
│   │
│   ├── components/
│   │   ├── ui/index.js                 ← PrimaryButton, Input, StepProgressBar…
│   │   └── common/ScreenLayout.js      ← Safe area + keyboard wrapper
│   │
│   └── screens/
│       ├── auth/
│       │   ├── LandingScreen.js        ← Animated landing page
│       │   ├── LoginScreen.js          ← Phone / email input
│       │   └── OtpScreen.js            ← 6-digit OTP boxes
│       ├── kyc/
│       │   ├── DashboardScreen.js      ← Step overview + status banner
│       │   ├── PersonalInfoScreen.js   ← Form with country picker
│       │   ├── IdCaptureScreen.js      ← Camera / gallery, front + back
│       │   ├── FaceVerifyScreen.js     ← Selfie with oval guide
│       │   └── LivenessScreen.js       ← Timed 3-challenge flow
│       └── result/
│           └── ResultScreen.js         ← Approved / Rejected / Pending
│
└── backend/
    └── main.py                         ← Optional FastAPI face-match server
```

---

## 🚀 Quick Start

### 1 · Install

```bash
npm install
```

### 2 · Start

```bash
npx expo start
```

Scan the QR with **Expo Go** (iOS / Android), or press `a` / `i` for emulators.

---

## 🔑 Demo Credentials

| Field | Value |
|-------|-------|
| Contact | Any phone number or email |
| OTP code | Any **6 digits** (e.g. `123456`) |

---

## 📦 Dependency Notes

These are the exact versions this project targets:

```json
"expo":                      "~54.0.33"
"react":                     "19.1.0"
"react-native":              "0.81.5"
"@reduxjs/toolkit":          "^2.5.0"
"react-redux":               "^9.2.0"
"@react-navigation/native":  "^6.1.18"
"@react-navigation/native-stack": "^6.11.0"
"expo-image-picker":         "~16.0.3"
"expo-secure-store":         "~14.0.0"
```

**Not included** (not in deps list, referenced in comments only):
- `expo-camera` / `expo-face-detector` — see upgrade path below
- `expo-linear-gradient` — replaced with native `backgroundColor` gradients

---

## 🧠 Architecture

### State Management — Redux Toolkit

```
store/
  authSlice.js   → isAuthenticated, user, token, isLoading, error
                    Thunks: initAuth, sendOtp, verifyOtp, logout

  kycSlice.js    → personalInfo, idCapture, faceVerify, liveness, result
                    Thunk: submitKyc (mock scoring)
```

### Navigation Flow

```
RootNavigator
  ├─ AuthNavigator  (when !isAuthenticated)
  │    Landing → Login → Otp
  └─ KycNavigator   (when isAuthenticated)
       Dashboard → PersonalInfo → IdCapture → FaceVerify → Liveness → Result
```

### Liveness Check — MVP

The MVP uses a **self-report timed challenge** (30 seconds):
1. Blink your eyes
2. Turn head LEFT
3. Turn head RIGHT

User taps "Done" after each. The session tracks completion.

### Face Matching — Mock

`submitKyc` thunk generates a realistic score (82–95%) when both selfie
and ID front are present. To connect real matching:

**Option A — on-device** (add `expo-face-detector`):
```js
// In faceDetectionService.js, updateFromFace(face) already
// handles yawAngle, leftEyeOpenProbability, smilingProbability
```

**Option B — FastAPI backend**:
```bash
cd backend
pip install fastapi uvicorn python-multipart face-recognition pillow
uvicorn main:app --host 0.0.0.0 --port 8000
```
Then update `BASE_URL` in `src/services/apiService.js` and call
`kycApi.matchFaces(selfieUri, idFrontUri)` from the `submitKyc` thunk.

---

## 🔐 Security Notes

| Concern | Implementation |
|---------|---------------|
| Auth token | `expo-secure-store` (encrypted on-device) |
| User PII | In-memory Redux only — never written to disk |
| Images | Temporary file URIs — not persisted between sessions |
| Production | Add HTTPS + cert pinning + image encryption before upload |

---

## ✅ Production Upgrade Checklist

- [ ] Replace mock OTP → Twilio / AWS SNS / Firebase Auth
- [ ] Replace mock face match → FastAPI + InsightFace or AWS Rekognition
- [ ] Add `expo-camera` + `expo-face-detector` for live camera liveness
- [ ] Implement retry limits (max 3 liveness, max 2 full KYC)
- [ ] Add document OCR (AWS Textract / Google Vision API)
- [ ] Certificate pinning + HTTPS enforcement
- [ ] Image encryption before S3/server upload
- [ ] Audit logging for compliance (GDPR / AML)
- [ ] Push notifications for pending → approved state changes
- [ ] Accessibility labels (a11y) on all interactive elements
# kyc
