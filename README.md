# CareCompanion

> A thoughtful Alzheimer's care web application with an accessibility-first **Patient Mode** and a full-featured **Caregiver Mode**.

> **Status:** Work in progress. Not for real patient data until the items in [Known Limitations](#-known-limitations) are resolved.

---

## 🌟 Overview

CareCompanion gives families living with Alzheimer's and cognitive impairment two experiences:

- **Patient Mode:** a single-task "What's Next" screen, high contrast, 22px+ text, 64px+ touch targets, text-to-speech, calm colours and a one-tap Help button. Patients sign in with a Family Code + PIN (on-screen keypad) or face recognition, never a password.
- **Caregiver Mode:** task management, recurring schedules, step-by-step guidance notes, live status monitoring, unresolved-alert banners and family messaging.

---

## 🛠 Tech Stack

| Area | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript), React 19 |
| Styling | Tailwind CSS 4 |
| Database & Auth | Supabase (PostgreSQL, Row Level Security, Auth, Realtime) |
| Validation | `zod` |
| Dates & timezones | `date-fns`, `date-fns-tz` (default: `Asia/Kolkata`) |
| Speech | Browser Web Speech API (`speechSynthesis`) |
| Face login | Python engine (YuNet + SFace) called from the server; embeddings encrypted with AES-256-GCM |
| Icons | `lucide-react` |
| PWA | Web App Manifest (`/manifest.json`) |

---

## 📂 Project Architecture

```
app/
  (marketing)/page.tsx        # Landing page with mode selection
  caregiver/                  # login, signup, onboarding, dashboard, tasks, messages, settings
  patient/                    # login, "What's next", task steps, today, family, me, help
  api/
    patient/login/            # PIN verification and session creation
    patient/create/           # Caregiver creates patient user (service role)
    cron/missed-tasks/        # Automated missed-task evaluator
components/
  ui/  patient/  caregiver/
lib/
  supabase/                   # browser, server and service-role (admin) clients
  tasks.ts                    # ensureTodayInstances, getCurrentTask
  time.ts                     # Date/time formatting, Postgres day-of-week
  speech.ts                   # SpeechSynthesis helper
  validators.ts               # Zod schemas
  defaultTasks.ts             # Demo-mode sample tasks
  taskTemplates.ts            # Starter task templates for caregivers
  biometrics/
    crypto.ts                 # AES-256-GCM encryption of face embeddings
    engine.ts                 # Spawns the Python face engine
    store.ts                  # Biometric template store (in-memory, demo only)
scripts/
  face_engine.py              # Face detect / enroll / verify / identify
supabase/
  migrations/
    00001_initial_schema.sql  # Tables, RLS policies, Realtime
    00002_face_biometrics.sql # Biometric templates + audit log
  seed.sql                    # Demo caregiver, patient and tasks
middleware.ts                 # Route protection by role
```

> Adjust folder names above if your layout differs (for example the location of the biometrics files).

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20.9 or newer
- A [Supabase](https://supabase.com) project
- Python 3.9+ (only for face login). Install the packages imported in `scripts/face_engine.py`. <!-- TODO: list exact packages / add requirements.txt -->

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
```bash
cp .env.example .env.local
```

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only. **Never expose to the browser.** |
| `CRON_SECRET` | Yes | Protects the cron endpoint. Generate your own: `openssl rand -hex 32` |
| `NEXT_PUBLIC_APP_URL` | Yes | e.g. `http://localhost:3000` |
| `BIOMETRIC_ENCRYPTION_KEY` | For face login | 32+ characters (or 64 hex chars). Generate: `openssl rand -hex 32` |
| `PYTHON_PATH` | Optional | Python binary for the face engine (default `python`; use `python3` on Linux/macOS) |

Without Supabase credentials the app runs in **placeholder/demo mode** with sample data.

### 3. Set up the database
In the Supabase SQL Editor, run in order:
1. `supabase/migrations/00001_initial_schema.sql`
2. `supabase/migrations/00002_face_biometrics.sql`
3. `supabase/seed.sql` (**development only**)

### 4. Run
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## 🔑 Demo Accounts (development only)

Created by `supabase/seed.sql`. **Never run the seed on a production database; these credentials are public.**

| Role | Login |
|---|---|
| Caregiver | `caregiver@carecompanion.local` / `password123` |
| Patient | Family Code `AMMA-4821`, PIN `1234` |

---

## 🧪 Manual Test Checklist

1. **Landing page:** both Patient and Caregiver modes appear; `/manifest.json` loads.
2. **Caregiver:** sign in or sign up, then complete `/caregiver/onboarding` to create a patient and receive a Family Code and PIN.
3. **Patient:** open `/patient/login`, enter Family Code and PIN on the keypad, confirm the home screen reads aloud.
4. **Tasks:** create a task as caregiver, mark it Done as patient, confirm the dashboard updates in real time.
5. **Help button:** press Help as patient, confirm an alert appears on the caregiver dashboard.

---

## ⚠️ Known Limitations

- The biometric store (`store.ts`) is **in-memory** and resets on restart; the `patient_biometrics` table is not used yet.
- The face engine runs as a **Python child process**, so it will not work on serverless hosts such as Vercel without changes.
- PIN login has no lockout or rate limiting yet.
- Some Row Level Security policies need tightening (caregiver linking, role changes). See open issues.
- The seed data and sample credentials are for development only.

---

## 🛠 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |

---

## 🤝 Contributing

1. Fork the repository and create a branch: `git checkout -b feature/your-change`
2. Make your change and run `npm run lint` and `npm run build`
3. Commit with a clear message and open a pull request describing what and why

---

## 📄 License

See [LICENSE](./LICENSE).
