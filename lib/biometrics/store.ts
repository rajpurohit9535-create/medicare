import { EncryptedBiometricTemplate } from "./crypto";

export interface StoredBiometricRecord {
  id: string;
  patientId: string;       // References patient ID (uuid)
  displayName: string;     // e.g. "Amma"
  familyCode: string;      // e.g. "AMMA-4821"
  model_version: string;
  template: EncryptedBiometricTemplate;
  status: "active" | "revoked";
  consentGiven: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

// In-memory persistent store for development/demo mode across hot reloads
const globalBiometrics = (globalThis as any).__carecompanion_patient_biometrics || new Map<string, StoredBiometricRecord>();
(globalThis as any).__carecompanion_patient_biometrics = globalBiometrics;

// Pre-seed demo patient Amma if store is initialized empty
const SEED_AMMA_ID = "22222222-2222-2222-2222-222222222222";
const SEED_AMMA_TEMPLATE: EncryptedBiometricTemplate = {
  encryptedEmbedding: "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",
  iv: "Y7FIsadRlP8VoWh4",
  tag: "h2Y5X6janYBwxeWm3h/7zg==",
};

function ensureSeed() {
  if (!globalBiometrics.has(SEED_AMMA_ID)) {
    globalBiometrics.set(SEED_AMMA_ID, {
      id: "bio-seed-amma",
      patientId: SEED_AMMA_ID,
      displayName: "Amma",
      familyCode: "AMMA-4821",
      model_version: "yunet-sface-v1",
      template: SEED_AMMA_TEMPLATE,
      status: "active",
      consentGiven: true,
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
    });
  }
}

export const biometricStore = {
  getByPatientId(patientId: string): StoredBiometricRecord | null {
    ensureSeed();
    const record = globalBiometrics.get(patientId);
    if (record && record.status === "active") {
      return record;
    }
    return null;
  },

  getByFamilyCode(familyCode: string): StoredBiometricRecord | null {
    ensureSeed();
    const clean = familyCode.trim().toUpperCase();
    for (const record of globalBiometrics.values()) {
      if (record.familyCode.toUpperCase() === clean && record.status === "active") {
        return record;
      }
    }
    return null;
  },

  getAllActive(): StoredBiometricRecord[] {
    ensureSeed();
    const active: StoredBiometricRecord[] = [];
    for (const record of globalBiometrics.values()) {
      if (record.status === "active") {
        active.push(record);
      }
    }
    return active;
  },

  save(record: StoredBiometricRecord): void {
    globalBiometrics.set(record.patientId, record);
  },

  revokeByPatientId(patientId: string): boolean {
    const record = globalBiometrics.get(patientId);
    if (record) {
      record.status = "revoked";
      return true;
    }
    return false;
  },

  // Backward-compatibility aliases
  getByUserId(userId: string): StoredBiometricRecord | null {
    return this.getByPatientId(userId);
  },

  revokeByUserId(userId: string): boolean {
    return this.revokeByPatientId(userId);
  },
};
