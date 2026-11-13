import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

function getEncryptionKey(): Buffer {
  const envKey = process.env.BIOMETRIC_ENCRYPTION_KEY;
  if (envKey && envKey.length >= 32) {
    // If hex string of 64 chars
    if (envKey.length === 64 && /^[0-9a-fA-F]+$/.test(envKey)) {
      return Buffer.from(envKey, "hex");
    }
    // Hash to exactly 32 bytes
    return crypto.createHash("sha256").update(envKey).digest();
  }
  // Fallback server key derived from service role key or fallback
  const fallback = process.env.SUPABASE_SERVICE_ROLE_KEY || "carecompanion_biometric_salt_key_default";
  return crypto.createHash("sha256").update(fallback).digest();
}

export interface EncryptedBiometricTemplate {
  encryptedEmbedding: string; // Base64 ciphertext
  iv: string;                 // Base64 12-byte IV
  tag: string;                // Base64 16-byte Auth Tag
}

/**
 * Encrypts a 128-dimensional biometric embedding vector using AES-256-GCM.
 * Never stores raw biometric vectors in plaintext.
 */
export function encryptEmbedding(embedding: number[]): EncryptedBiometricTemplate {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const plaintext = JSON.stringify(embedding);
  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");
  const tag = cipher.getAuthTag();

  return {
    encryptedEmbedding: encrypted,
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
  };
}

/**
 * Decrypts an AES-256-GCM encrypted template back to the 128-d floating point embedding.
 */
export function decryptEmbedding(template: EncryptedBiometricTemplate): number[] {
  const key = getEncryptionKey();
  const iv = Buffer.from(template.iv, "base64");
  const tag = Buffer.from(template.tag, "base64");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(template.encryptedEmbedding, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return JSON.parse(decrypted);
}

