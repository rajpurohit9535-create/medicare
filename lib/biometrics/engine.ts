import { spawn } from "child_process";
import path from "path";

export interface DetectResult {
  success: boolean;
  bbox?: [number, number, number, number];
  confidence?: number;
  quality?: {
    sharpness: number;
    is_blurred: boolean;
    brightness: number;
    is_good_lighting: boolean;
  };
  error?: string;
  message?: string;
}

export interface EnrollResult {
  success: boolean;
  embedding?: number[];
  frames_enrolled?: number;
  mean_sharpness?: number;
  model_version?: string;
  error?: string;
  message?: string;
}

export interface VerifyResult {
  success: boolean;
  verified?: boolean;
  similarity_score?: number;
  threshold?: number;
  confidence?: number;
  liveness_passed?: boolean;
  error?: string;
  message?: string;
}

export interface IdentifyResult {
  success: boolean;
  matched?: boolean;
  matched_id?: string;
  similarity_score?: number;
  threshold?: number;
  confidence?: number;
  liveness_passed?: boolean;
  error?: string;
  message?: string;
}

const SCRIPT_PATH = path.join(process.cwd(), "scripts", "face_engine.py");

async function runFaceEngine<T>(action: "detect" | "enroll" | "verify" | "identify", payload: Record<string, unknown>): Promise<T> {
  return new Promise((resolve, reject) => {
    const pythonBin = process.env.PYTHON_PATH || "python";
    const py = spawn(/*turbopackIgnore: true*/ pythonBin, [SCRIPT_PATH, action], {
      windowsHide: true,
      env: { ...process.env, PYTHONUNBUFFERED: "1" },
    });

    let stdoutData = "";
    let stderrData = "";

    const timer = setTimeout(() => {
      py.kill();
      reject(new Error("Biometric processing timed out (exceeded 10 seconds)."));
    }, 10000);

    py.stdout.on("data", (chunk) => {
      stdoutData += chunk.toString();
    });

    py.stderr.on("data", (chunk) => {
      stderrData += chunk.toString();
    });

    py.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0 && !stdoutData.trim()) {
        reject(new Error(`Face engine exited with code ${code}: ${stderrData}`));
        return;
      }

      try {
        // Strip any OpenCV C++ log warnings before the JSON
        const trimmed = stdoutData.trim();
        const jsonStart = trimmed.indexOf("{");
        const jsonEnd = trimmed.lastIndexOf("}");
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const jsonStr = trimmed.slice(jsonStart, jsonEnd + 1);
          const parsed = JSON.parse(jsonStr) as T;
          resolve(parsed);
        } else {
          reject(new Error(`Invalid response from biometric engine: ${stdoutData}`));
        }
      } catch (err) {
        reject(new Error(`Failed to parse biometric engine response: ${String(err)} (stdout: ${stdoutData})`));
      }
    });

    py.stdin.write(JSON.stringify(payload));
    py.stdin.end();
  });
}

export const faceEngine = {
  async detect(frameB64: string): Promise<DetectResult> {
    return runFaceEngine<DetectResult>("detect", { frame: frameB64 });
  },

  async enroll(framesB64: string[]): Promise<EnrollResult> {
    return runFaceEngine<EnrollResult>("enroll", { frames: framesB64 });
  },

  async verify(probeB64: string, template: number[]): Promise<VerifyResult> {
    return runFaceEngine<VerifyResult>("verify", { frame: probeB64, template });
  },

  async identify(probeB64: string, candidates: Array<{ id: string; template: number[] }>): Promise<IdentifyResult> {
    return runFaceEngine<IdentifyResult>("identify", { frame: probeB64, candidates });
  },
};

