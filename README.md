# CareCompanion

> **Thoughtful Alzheimer's Care Web Application** with dedicated, accessibility-first **Patient Mode** and comprehensive **Caregiver Mode**.

---

## 🌟 Overview

CareCompanion provides dual experiences designed specifically for families living with Alzheimer's and cognitive impairment:
- **Patient Mode:** Single-task "What's Next" hero screen, high contrast, 22px+ text, 64px+ touch targets, browser Text-to-Speech (TTS), calm colors, and a 1-tap Help emergency button. Never uses passwords or technical errors.
- **Caregiver Mode:** Task management, recurring schedule setup, step-by-step guidance notes, live status monitoring, unresolved alert banners, and instant family messaging.

---

## 🛠 Tech Stack

- **Framework:** Next.js 14+ (App Router with TypeScript)
- **Styling:** Tailwind CSS (custom calm palette, high accessibility)
- **Database & Auth:** Supabase (PostgreSQL, Row Level Security, Auth, Realtime)
- **Icons:** `lucide-react` (paired with descriptive labels)
- **Validation:** `zod`
- **Speech:** Native browser Web Speech API (`window.speechSynthesis`)
- **PWA:** Web App Manifest (`/manifest.json`), installable on tablets and mobile phones

---

## 📂 Project Architecture

```
app/
  (marketing)/page.tsx        # Landing page with mode selection
  caregiver/
    login/page.tsx            # Email & password caregiver sign in
    signup/page.tsx           # Caregiver registration
    onboarding/page.tsx       # Link patient profile, generate Family Code & PIN
    page.tsx                  # Caregiver live dashboard
    tasks/page.tsx            # Routine and task template manager
    tasks/[id]/page.tsx       # Edit task details
    messages/page.tsx         # Caregiver chat thread and quick replies
    settings/page.tsx         # Patient settings & pairing codes
  patient/
    login/page.tsx            # Patient login (Family Code + PIN, on-screen keypad)
    page.tsx                  # "What's next" hero screen with Done & Remind later
    task/[id]/page.tsx        # Step-by-step guided breakdown
    today/page.tsx            # Vertical daily timeline
    family/page.tsx           # Contact photo cards & 1-tap preset messages
    me/page.tsx               # "Who am I" orientation screen
    help/page.tsx             # Emergency 1-tap Help alert
  api/
    patient/login/route.ts    # Secure PIN verification & long-lived session creation
    patient/create/route.ts   # Caregiver creates patient auth user (service role)
    cron/missed-tasks/route.ts# 5-minute automated missed-task evaluator
components/
  ui/                         # BigButton, StatusChip
  patient/                    # TaskCard, PatientHeader, SpeakButton, BottomNav
  caregiver/                  # AlertBanner, IconPicker
lib/
  supabase/                   # client, server, and service-role admin clients
  tasks.ts                    # ensureTodayInstances & getCurrentTask logic
  time.ts                     # Patient header date & time formatting
  speech.ts                   # SpeechSynthesis helper
  validators.ts               # Zod validation schemas
supabase/
  migrations/
    00001_initial_schema.sql  # Postgres schema, RLS policies, Realtime publication
  seed.sql                    # Demo caregiver, Amma profile, 8 daily tasks
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase project credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
CRON_SECRET=carecompanion_cron_secret_key_32bytes_min
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Apply Supabase Database Schema & Seed
In your Supabase SQL Editor:
1. Run `supabase/migrations/00001_initial_schema.sql`
2. Run `supabase/seed.sql`

This sets up:
- **Caregiver account:** `caregiver@carecompanion.local` / `password123`
- **Patient account:** Family Code: `AMMA-4821`, PIN: `1234`
- **8 Daily tasks:** Morning tablets, breakfast, garden walk, lunch, afternoon rest, etc.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧪 Testing Phase 0 & Phase 1

1. **PWA Manifest & Landing Page:**
   - Navigate to `http://localhost:3000`
   - Verify the landing page shows both "Patient Mode" and "Caregiver Mode" options.
   - Check `http://localhost:3000/manifest.json` loads the PWA configuration.

2. **Caregiver Registration & Login:**
   - Open `/caregiver/login`
   - Test sign in with `caregiver@carecompanion.local` or register a new caregiver at `/caregiver/signup`.
   - After registration, complete `/caregiver/onboarding` to create a linked patient profile and receive a Family Code and PIN.

3. **Patient Mode Login:**
   - Open `/patient/login`
   - Enter Family Code (e.g. `AMMA-4821`) and PIN (`1234`) using the on-screen keypad.
   - Tap "Open" to enter the patient home screen.
   - Verify text-to-speech reads the greetings and cards aloud.
