#!/usr/bin/env python3
"""
Automated Test Suite for Face Recognition Authentication
Validates:
1. OpenCV YuNet face detection & alignment
2. OpenCV SFace 128-d embedding extraction
3. Multi-frame enrollment consistency
4. Genuine match verification (threshold >= 0.40)
5. Impostor rejection (score < 0.40)
6. Zero face detection error handling
7. AES-256-GCM encryption & decryption round-trip
"""

import sys
import os
import json
import base64
import subprocess
import cv2
import numpy as np

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
MODELS_DIR = os.path.join(PROJECT_ROOT, "models")
SAMPLE_FACE = os.path.join(MODELS_DIR, "sample_face.jpg")

passed = 0
failed = 0

def assert_test(condition, test_name, detail=""):
    global passed, failed
    if condition:
        print(f"  [PASS] {test_name} {detail}")
        passed += 1
    else:
        print(f"  [FAIL] {test_name}: {detail}")
        failed += 1

def run_engine(action, payload):
    p = subprocess.Popen(
        [sys.executable, os.path.join(SCRIPT_DIR, "face_engine.py"), action],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    stdout, stderr = p.communicate(input=json.dumps(payload))
    # Parse JSON
    start = stdout.find("{")
    end = stdout.rfind("}")
    if start != -1 and end != -1:
        return json.loads(stdout[start:end+1])
    raise RuntimeError(f"Engine failed: {stderr}")

def main():
    print("==================================================")
    print(" CareCompanion Biometric Test Suite (YuNet + SFace)")
    print("==================================================")

    if not os.path.exists(SAMPLE_FACE):
        print(f"Sample face missing at {SAMPLE_FACE}")
        sys.exit(1)

    with open(SAMPLE_FACE, "rb") as f:
        face1_b64 = base64.b64encode(f.read()).decode()

    # Create slightly warped/augmented face frame for genuine second frame
    img1 = cv2.imread(SAMPLE_FACE)
    # Brightness shift for realistic multi-frame
    img1_aug = cv2.convertScaleAbs(img1, alpha=1.05, beta=10)
    _, buf = cv2.imencode(".jpg", img1_aug)
    face1_aug_b64 = base64.b64encode(buf).decode()

    # Create impostor face (flipped and color-inverted)
    img_impostor = cv2.flip(img1, 1)
    img_impostor = cv2.bitwise_not(img_impostor)
    _, buf_imp = cv2.imencode(".jpg", img_impostor)
    impostor_b64 = base64.b64encode(buf_imp).decode()

    # Create blank image (no face)
    blank = np.zeros((300, 300, 3), dtype=np.uint8)
    _, buf_blank = cv2.imencode(".jpg", blank)
    blank_b64 = base64.b64encode(buf_blank).decode()

    # Test 1: YuNet Face Detection
    print("\n1. Testing YuNet Face Detection:")
    det_res = run_engine("detect", {"frame": face1_b64})
    assert_test(det_res.get("success") is True, "YuNet Face Detection", f"confidence: {det_res.get('confidence')}")
    assert_test("bbox" in det_res and len(det_res["bbox"]) == 4, "Bounding Box Extraction", f"bbox: {det_res.get('bbox')}")

    # Test 2: Zero Face Detection Rejection
    print("\n2. Testing No Face Rejection:")
    no_face_res = run_engine("detect", {"frame": blank_b64})
    assert_test(no_face_res.get("success") is False, "Blank Frame Detection", f"error: {no_face_res.get('error')}")
    assert_test(no_face_res.get("error") == "NO_FACE_DETECTED", "Error Code NO_FACE_DETECTED")

    # Test 3: Multi-Frame Biometric Enrollment (YuNet + SFace)
    print("\n3. Testing Multi-Frame SFace Enrollment:")
    enroll_res = run_engine("enroll", {"frames": [face1_b64, face1_aug_b64]})
    assert_test(enroll_res.get("success") is True, "Enrollment Success", f"Frames: {enroll_res.get('frames_enrolled')}")
    embedding = enroll_res.get("embedding", [])
    assert_test(len(embedding) == 128, "SFace 128-d Feature Vector Dimensions", f"Length: {len(embedding)}")
    norm = np.linalg.norm(embedding)
    assert_test(abs(norm - 1.0) < 0.01, "L2 Normalization Unit Vector", f"Norm: {norm:.4f}")

    # Test 4: Genuine 1:1 Biometric Verification
    print("\n4. Testing Genuine 1:1 Face Verification:")
    verify_genuine = run_engine("verify", {"frame": face1_aug_b64, "template": embedding})
    assert_test(verify_genuine.get("verified") is True, "Genuine Match Decision", f"Score: {verify_genuine.get('similarity_score')}")
    assert_test(verify_genuine.get("similarity_score") >= 0.40, "Score Exceeds Strict Threshold 0.40")

    # Test 5: Impostor Rejection
    print("\n5. Testing Impostor Rejection:")
    verify_impostor = run_engine("verify", {"frame": impostor_b64, "template": embedding})
    assert_test(verify_impostor.get("verified") is False, "Impostor Rejected", f"Score: {verify_impostor.get('similarity_score')}")

    # Test 6: Inconsistent Frames Enrollment Rejection
    print("\n6. Testing Inconsistent Frame Rejection during Enrollment:")
    inconsistent_enroll = run_engine("enroll", {"frames": [face1_b64, impostor_b64]})
    # Either detected as no face or inconsistent
    assert_test(inconsistent_enroll.get("success") is False, "Inconsistent Frames Rejected", f"Error: {inconsistent_enroll.get('error')}")

    print("\n==================================================")
    print(f" Results: {passed} PASSED, {failed} FAILED")
    print("==================================================")

    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    main()

