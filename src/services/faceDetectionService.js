// src/services/faceDetectionService.js
/**
 * Face Detection Service
 * ──────────────────────────────────────────────────────────────────────────────
 * MVP: Uses expo-image-picker for capture (no expo-camera/face-detector in deps).
 * Liveness simulation runs via a timed challenge flow — user self-reports
 * completion, which is validated client-side with timers and interaction events.
 *
 * PRODUCTION UPGRADE PATH
 * ──────────────────────────────────────────────────────────────────────────────
 * Option A – On-device (add to deps):
 *   expo-camera + expo-face-detector (Google ML Kit)
 *   → Real yaw/pitch/roll, eye-open probability, smile probability
 *
 * Option B – API-based (recommended for accuracy):
 *   POST selfie + id_photo → FastAPI → InsightFace / DeepFace
 *   → Returns { similarity: 0.92, verdict: "match", score: 92 }
 *
 * See /backend/main.py for the ready-to-use FastAPI implementation.
 * ──────────────────────────────────────────────────────────────────────────────
 */

// ─── Face Quality Assessment (mock — replace with ML Kit in production) ───────

/**
 * Simulates quality assessment for a captured image.
 * In production, run this after expo-face-detector returns face bounds.
 */
export function assessImageQuality(imageUri) {
  if (!imageUri) return { ok: false, reason: 'No image provided' };
  // Production: check face bounds size, pose angles, blur score
  return { ok: true, reason: null };
}

// ─── Liveness Session ─────────────────────────────────────────────────────────

/**
 * Creates a stateful liveness session tracker.
 * MVP: Tracks which challenges the user has manually completed.
 * Production: Feed face-detector frames into update() for auto-detection.
 */
export function createLivenessSession() {
  const state = {
    blinkDetected:  false,
    headTurnLeft:   false,
    headTurnRight:  false,
    smileDetected:  false,
    frameCount:     0,
    // Internal counters for frame-based detection (production)
    _blinkFrames:   0,
    _openFrames:    0,
  };

  /**
   * Update session with a face-detector result frame.
   * Call this inside onFacesDetected callback when using expo-face-detector.
   *
   * @param {Object} face - Face object from expo-face-detector
   * @param {number} face.leftEyeOpenProbability  - 0..1
   * @param {number} face.rightEyeOpenProbability - 0..1
   * @param {number} face.yawAngle   - degrees, + = right, - = left
   * @param {number} face.smilingProbability - 0..1
   */
  function updateFromFace(face) {
    if (!face) return state;
    state.frameCount++;

    // Blink detection: both eyes closed for ≥2 frames then open
    const bothClosed =
      (face.leftEyeOpenProbability  ?? 1) < 0.25 &&
      (face.rightEyeOpenProbability ?? 1) < 0.25;

    if (bothClosed) {
      state._blinkFrames++;
    } else {
      if (state._blinkFrames >= 2) state.blinkDetected = true;
      state._blinkFrames = 0;
    }

    // Head turn detection
    const yaw = face.yawAngle ?? 0;
    if (yaw < -18) state.headTurnLeft  = true;
    if (yaw >  18) state.headTurnRight = true;

    // Smile
    if ((face.smilingProbability ?? 0) > 0.65) state.smileDetected = true;

    return state;
  }

  /** Manually mark a challenge complete (used in MVP timed-challenge mode) */
  function markChallenge(key) {
    if (key in state) state[key] = true;
    return state;
  }

  /** Returns true when minimum required challenges are done */
  function isPassed() {
    return state.blinkDetected && (state.headTurnLeft || state.headTurnRight);
  }

  function getState() { return { ...state }; }

  return { updateFromFace, markChallenge, isPassed, getState };
}

// ─── Face Similarity (mock for MVP) ──────────────────────────────────────────

/**
 * Computes a face similarity score between selfie and ID photo.
 *
 * MVP: Returns a realistic mock score.
 * Production: Replace body with API call to /kyc/match-faces
 *
 * @returns {{ score: number, verdict: 'match'|'no_match' }}
 */
export async function computeFaceSimilarity(selfieUri, idPhotoUri) {
  await delay(1800);
  if (!selfieUri || !idPhotoUri) return { score: 0, verdict: 'no_data' };
  const score   = Math.floor(Math.random() * 13) + 83; // 83–95
  const verdict = score >= 75 ? 'match' : 'no_match';
  return { score, verdict };
}

// ─── Liveness Challenges Definition ──────────────────────────────────────────

export const LIVENESS_CHALLENGES = [
  {
    key:    'blinkDetected',
    icon:   '👁️',
    title:  'Blink your eyes',
    detail: 'Slowly blink both eyes once',
    durationMs: 4000,
  },
  {
    key:    'headTurnLeft',
    icon:   '⬅️',
    title:  'Turn head LEFT',
    detail: 'Slowly rotate your head to the left',
    durationMs: 4000,
  },
  {
    key:    'headTurnRight',
    icon:   '➡️',
    title:  'Turn head RIGHT',
    detail: 'Slowly rotate your head to the right',
    durationMs: 4000,
  },
];

// ─── Image validation helpers ─────────────────────────────────────────────────

/** Returns true if a URI string looks like a valid local file URI */
export function isValidImageUri(uri) {
  if (!uri || typeof uri !== 'string') return false;
  return uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith('ph://');
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
