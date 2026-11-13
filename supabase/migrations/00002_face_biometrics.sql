-- CareCompanion Patient Face Biometrics Migration
-- Integrates passwordless face recognition (YuNet + SFace) for Alzheimer's / Dementia Patients

create table if not exists public.patient_biometrics (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  model_version text not null default 'yunet-sface-v1',
  encrypted_embedding text not null,       -- AES-256-GCM encrypted 128-d SFace vector
  encryption_iv text not null,             -- Base64 initialization vector
  encryption_tag text not null,            -- Base64 authentication tag
  status text not null default 'active' check (status in ('active', 'revoked')),
  consent_given boolean not null default true,
  consent_timestamp timestamptz default now(),
  created_at timestamptz default now(),
  last_used_at timestamptz
);

-- Index for fast 1:N automatic patient identification search
create index if not exists idx_patient_biometrics_status
  on public.patient_biometrics (status);

create index if not exists idx_patient_biometrics_patient
  on public.patient_biometrics (patient_id, status);

-- Audit log for patient face authentication attempts
create table if not exists public.biometric_audit_logs (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patients(id) on delete set null,
  event_type text not null check (event_type in ('enrollment', 'verify_success', 'verify_failure', 'revocation', 'pin_fallback')),
  similarity_score numeric(5, 4),
  liveness_passed boolean,
  failure_reason text,
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);

create index if not exists idx_biometric_audit_logs_patient
  on public.biometric_audit_logs (patient_id, created_at desc);

-- Row Level Security
alter table public.patient_biometrics enable row level security;
alter table public.biometric_audit_logs enable row level security;

-- Caregivers linked to the patient can manage their patient's biometrics
create policy "Caregivers can view linked patient biometrics"
  on public.patient_biometrics for select
  using (
    exists (
      select 1 from public.caregiver_patients cp
      where cp.patient_id = public.patient_biometrics.patient_id
      and cp.caregiver_id = auth.uid()
    )
    or auth.uid() = patient_id
  );

create policy "Caregivers can update linked patient biometrics"
  on public.patient_biometrics for update
  using (
    exists (
      select 1 from public.caregiver_patients cp
      where cp.patient_id = public.patient_biometrics.patient_id
      and cp.caregiver_id = auth.uid()
    )
    or auth.uid() = patient_id
  );

create policy "Caregivers can delete linked patient biometrics"
  on public.patient_biometrics for delete
  using (
    exists (
      select 1 from public.caregiver_patients cp
      where cp.patient_id = public.patient_biometrics.patient_id
      and cp.caregiver_id = auth.uid()
    )
    or auth.uid() = patient_id
  );
