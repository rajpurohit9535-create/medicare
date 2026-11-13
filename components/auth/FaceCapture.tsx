"use client";

import { useRef, useState, useEffect } from "react";
import { Camera, AlertCircle, RefreshCw, Upload, CheckCircle2 } from "lucide-react";

interface FaceCaptureProps {
  mode: "verify" | "enroll";
  isProcessing: boolean;
  onCaptureFrame: (frameB64: string) => void;
  onCaptureFrames?: (framesB64: string[]) => void;
  onCancel?: () => void;
}

export function FaceCapture({
  mode,
  isProcessing,
  onCaptureFrame,
  onCaptureFrames,
  onCancel,
}: FaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedCount, setCapturedCount] = useState(0);
  const totalFramesNeeded = 3;

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Webcam access is not supported by your browser. Please use photo upload or recovery.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setHasPermission(true);
    } catch (err: unknown) {
      console.warn("Camera access failed:", err);
      setHasPermission(false);
      const msg =
        err instanceof Error
          ? err.message.includes("Permission denied")
            ? "Camera permission was denied. Please allow camera access in your browser settings."
            : err.message
          : "Could not start camera.";
      setCameraError(msg);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const grabCurrentFrame = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    if (video.videoWidth === 0 && video.readyState < 2) {
      return null;
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", 0.92);
  };

  const handleSingleCapture = () => {
    const frame = grabCurrentFrame();
    if (frame) {
      onCaptureFrame(frame);
    }
  };

  const handleEnrollBurst = async () => {
    setCapturedCount(0);
    const frames: string[] = [];

    for (let i = 0; i < totalFramesNeeded; i++) {
      const frame = grabCurrentFrame();
      if (frame) {
        frames.push(frame);
        setCapturedCount(i + 1);
      }
      await new Promise((res) => setTimeout(res, 400));
    }

    if (frames.length >= 2 && onCaptureFrames) {
      onCaptureFrames(frames);
    }
  };

  // Fallback: Upload image file for accessibility/testing
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      if (mode === "enroll" && onCaptureFrames) {
        onCaptureFrames([b64, b64]);
      } else {
        onCaptureFrame(b64);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Video Viewport with Oval Guide */}
      <div className="relative w-full aspect-4/3 rounded-3xl overflow-hidden bg-black shadow-lg border-4 border-white">
        {hasPermission === false && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-gray-900 z-10">
            <AlertCircle className="w-12 h-12 text-amber-400 mb-3" />
            <p className="text-sm font-semibold mb-3">{cameraError}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={startCamera}
                className="px-4 py-2 rounded-xl bg-white text-gray-900 font-bold text-xs flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Camera
              </button>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1]"
        />

        {/* Face Guide Oval */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-56 h-72 rounded-[50%] border-3 border-dashed border-[#2E7D32]/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)] transition-all flex items-center justify-center">
            {isProcessing && (
              <div className="bg-black/60 px-4 py-2 rounded-xl text-white text-xs font-bold animate-pulse">
                Analyzing Biometrics...
              </div>
            )}
          </div>
        </div>

        {/* Progress indicator during enrollment burst */}
        {mode === "enroll" && capturedCount > 0 && (
          <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-xs p-2 rounded-xl text-center text-white text-xs font-bold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span>Captured {capturedCount} of {totalFramesNeeded} frames</span>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-2.5 text-center">
        Position your face inside the green oval in a well-lit area.
      </p>

      {/* Action Buttons */}
      <div className="w-full mt-5 space-y-3">
        {mode === "verify" ? (
          <button
            type="button"
            disabled={isProcessing || hasPermission === false}
            onClick={handleSingleCapture}
            className="w-full min-h-[58px] rounded-2xl bg-[#2E7D32] hover:bg-[#256629] active:scale-[0.98] text-white text-lg font-bold shadow-md flex items-center justify-center gap-2.5 transition cursor-pointer touch-manipulation disabled:opacity-50 select-none"
          >
            <Camera className="w-6 h-6" />
            {isProcessing ? "Scanning Face..." : "Verify & Sign In"}
          </button>
        ) : (
          <button
            type="button"
            disabled={isProcessing || hasPermission === false}
            onClick={handleEnrollBurst}
            className="w-full min-h-[58px] rounded-2xl bg-[#2E7D32] hover:bg-[#256629] active:scale-[0.98] text-white text-lg font-bold shadow-md flex items-center justify-center gap-2.5 transition cursor-pointer touch-manipulation disabled:opacity-50 select-none"
          >
            <Camera className="w-6 h-6" />
            {isProcessing ? "Extracting Biometrics..." : "Capture Face Frames"}
          </button>
        )}

        {/* Fallback Upload & Cancel Row */}
        <div className="flex items-center justify-between text-xs text-gray-500 px-1">
          <label className="cursor-pointer hover:text-gray-800 flex items-center gap-1 font-semibold">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload photo fallback</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="hover:text-gray-800 font-semibold cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

