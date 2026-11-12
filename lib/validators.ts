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
  patientId: z.string().uuid(),
  title: z.string().min(2, "Task title is required"),
  icon: z.enum(taskIcons).default("check"),
  category: z.enum(taskCategories).default("general"),
  timeOfDay: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, "Valid time (HH:MM) required"),
  repeatDays: z.array(z.number().int().min(1).max(7)).default([1, 2, 3, 4, 5, 6, 7]),
  startDate: z.string().optional(),
  endDate: z.string().optional().nullable(),
  steps: z.array(z.string()).default([]),
  caregiverNote: z.string().optional().nullable(),
  encouragement: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const sendMessageSchema = z.object({
  patientId: z.string().uuid(),
  body: z.string().min(1, "Message text cannot be empty"),
  kind: z.enum(["preset", "text"]).default("text"),
});

export const alertCreateSchema = z.object({
  patientId: z.string().uuid(),
  type: z.enum(["help", "missed_task", "inactive"]),
  message: z.string().optional(),
  taskInstanceId: z.string().uuid().optional().nullable(),
});

