import { z } from "zod";

export const taskIcons = [
  "pill",
  "utensils",
  "droplet",
  "walk",
  "bed",
  "phone",
  "sun",
  "toothbrush",
  "shower",
  "tv",
  "heart",
  "check",
] as const;

export const taskCategories = [
  "medicine",
  "meal",
  "hygiene",
  "activity",
  "rest",
  "social",
  "general",
] as const;

export const caregiverSignupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const caregiverLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const patientCreateSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  homeAddress: z.string().min(3, "Home address is required for patient safety"),
  livesWith: z.string().min(2, "Please specify who the patient lives with"),
  pin: z.string().regex(/^\d{4,6}$/, "PIN must be between 4 and 6 digits"),
  timezone: z.string().default("Asia/Kolkata"),
});

export const patientLoginSchema = z.object({
  familyCode: z.string().min(3, "Family code is required").transform((val) => val.trim().toUpperCase()),
  pin: z.string().regex(/^\d{4,6}$/, "PIN must be between 4 and 6 digits"),
});

export const taskSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required").default("22222222-2222-2222-2222-222222222222"),
  title: z.string().min(1, "Task title is required").trim(),
  icon: z
    .string()
    .optional()
    .default("check")
    .transform((val) => ((taskIcons as readonly string[]).includes(val || "") ? val : "check")),
  category: z
    .string()
    .optional()
    .default("general")
    .transform((val) => ((taskCategories as readonly string[]).includes(val || "") ? val : "general")),
  timeOfDay: z
    .string()
    .optional()
    .default("08:00")
    .transform((val) => {
      const trimmed = (val || "").trim();
      if (!trimmed) return "08:00";
      const match24 = trimmed.match(/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(:[0-5][0-9])?$/);
      if (match24) {
        return `${match24[1].padStart(2, "0")}:${match24[2]}`;
      }
      const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
      if (match12) {
        let h = parseInt(match12[1], 10);
        const m = match12[2];
        const meridiem = (match12[3] || "").toLowerCase();
        if (meridiem === "pm" && h < 12) h += 12;
        if (meridiem === "am" && h === 12) h = 0;
        return `${String(h).padStart(2, "0")}:${m}`;
      }
      return "08:00";
    }),
  repeatDays: z
    .any()
    .optional()
    .transform((val) => {
      if (Array.isArray(val) && val.length > 0) {
        const nums = val.map(Number).filter((n) => Number.isInteger(n) && n >= 1 && n <= 7);
        if (nums.length > 0) return Array.from(new Set(nums)).sort();
      }
      return [1, 2, 3, 4, 5, 6, 7];
    }),
  startDate: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : new Date().toISOString().split("T")[0])),
  endDate: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  steps: z
    .any()
    .optional()
    .transform((val) => {
      if (Array.isArray(val)) {
        return val.map((s) => String(s).trim()).filter((s) => s.length > 0);
      }
      return [];
    }),
  caregiverNote: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  encouragement: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  isActive: z.boolean().default(true),
});

export const sendMessageSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  body: z.string().min(1, "Message text cannot be empty"),
  kind: z.enum(["preset", "text"]).default("text"),
});

export const alertCreateSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  type: z.enum(["help", "missed_task", "inactive"]),
  message: z.string().optional(),
  taskInstanceId: z.string().optional().nullable(),
});

