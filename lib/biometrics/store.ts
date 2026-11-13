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

export const biometricStore = {
  getByPatientId(patientId: string): StoredBiometricRecord | null {
    const record = globalBiometrics.get(patientId);
    if (record && record.status === "active") {
      return record;
    }
    return null;
  },

  getByFamilyCode(familyCode: string): StoredBiometricRecord | null {
    const clean = familyCode.trim().toUpperCase();
    for (const record of globalBiometrics.values()) {
      if (record.familyCode.toUpperCase() === clean && record.status === "active") {
        return record;
      }
    }
    return null;
  },

  getAllActive(): StoredBiometricRecord[] {
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
