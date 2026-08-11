# backend/main.py
"""
VerifyMe KYC — FastAPI Backend (Optional)
==========================================
Handles face matching when on-device accuracy is insufficient.

Install:
  pip install fastapi uvicorn python-multipart face-recognition pillow numpy

Run:
  uvicorn main:app --host 0.0.0.0 --port 8000 --reload

Docs: http://localhost:8000/docs
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import face_recognition
import numpy as np
from PIL import Image
import io, uuid, time, hashlib

app = FastAPI(title="VerifyMe KYC API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# ─── Auth ──────────────────────────────────────────────────────────────────────
class OtpRequest(BaseModel):
    contact: str

class OtpVerify(BaseModel):
    contact: str
    otp: str

@app.post("/v1/auth/send-otp")
async def send_otp(req: OtpRequest):
    # Production: integrate Twilio / AWS SNS
    return {"success": True, "message": "OTP sent", "expires_in": 300}

@app.post("/v1/auth/verify-otp")
async def verify_otp(req: OtpVerify):
    if len(req.otp) != 6:
        raise HTTPException(400, "Invalid OTP format")
    token = hashlib.sha256(f"{req.contact}{time.time()}".encode()).hexdigest()[:32]
    return {"success": True, "token": f"bearer_{token}", "user_id": str(uuid.uuid4())}

# ─── Face Match ────────────────────────────────────────────────────────────────
@app.post("/v1/kyc/match-faces")
async def match_faces(
    selfie:   UploadFile = File(...),
    id_photo: UploadFile = File(...),
):
    """
    Compare selfie vs ID using face_recognition (dlib 128-d embeddings).
    Returns similarity 0-100 and verdict.
    """
    try:
        s_bytes  = await selfie.read()
        id_bytes = await id_photo.read()

        s_img  = face_recognition.load_image_file(io.BytesIO(s_bytes))
        id_img = face_recognition.load_image_file(io.BytesIO(id_bytes))

        s_enc  = face_recognition.face_encodings(s_img)
        id_enc = face_recognition.face_encodings(id_img)

        if not s_enc:  raise HTTPException(422, "No face in selfie")
        if not id_enc: raise HTTPException(422, "No face in ID photo")

        distance = face_recognition.face_distance([id_enc[0]], s_enc[0])[0]
        score    = max(0, min(100, int((1 - distance / 0.6) * 100)))
        verdict  = "match" if distance < 0.5 else "no_match"

        return {
            "score": score, "similarity": score,
            "distance": round(float(distance), 4),
            "verdict": verdict, "threshold": 75,
        }
    except HTTPException: raise
    except Exception as e: raise HTTPException(500, str(e))

# ─── KYC Submit ────────────────────────────────────────────────────────────────
class KycSubmit(BaseModel):
    full_name:        str
    dob:              str
    country:          str
    similarity_score: float
    liveness_passed:  bool

@app.post("/v1/kyc/submit")
async def submit_kyc(payload: KycSubmit):
    reasons = []
    if payload.similarity_score < 75: reasons.append("Face similarity score too low")
    if not payload.liveness_passed:   reasons.append("Liveness check failed")
    if not payload.full_name:         reasons.append("Missing personal information")

    if not reasons and payload.similarity_score >= 80 and payload.liveness_passed:
        status = "approved"
    elif len(reasons) >= 2 or payload.similarity_score < 60:
        status = "rejected"
    else:
        status = "pending"

    return {
        "reference_id": f"KYC-{uuid.uuid4().hex[:8].upper()}",
        "status": status, "score": payload.similarity_score, "reasons": reasons,
    }

@app.get("/health")
async def health(): return {"status": "ok"}
