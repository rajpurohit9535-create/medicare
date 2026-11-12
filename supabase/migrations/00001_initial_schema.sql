-- CareCompanion Initial Schema Migration
-- Matches Build Spec Section 5

-- 1. Profiles (one row per auth user)
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null check (role in ('caregiver','patient')),
  full_name text not null,
  created_at timestamptz default now()
);

-- 2. Patient details (one row per patient user)
create table if not exists public.patients (
  id uuid primary key references public.profiles(id) on delete cascade,
  display_name text not null,          -- what the app calls them, e.g. "Amma"
  family_code text unique not null,    -- e.g. AMMA-4821
  pin_hash text not null,
  home_address text,
  lives_with text,                     -- free text, e.g. "Ravi (son), Priya (daughter-in-law)"
  timezone text default 'Asia/Kolkata',
  created_at timestamptz default now()
);

-- 3. Which caregivers can see which patients
create table if not exists public.caregiver_patients (
  caregiver_id uuid references public.profiles(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete cascade,
  primary key (caregiver_id, patient_id)
);

-- 4. Task templates (the plan)
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patients(id) on delete cascade,
  title text not null,                 -- "Take your morning tablet"
  icon text not null default 'check',  -- pill, utensils, droplet, walk, bed, phone, sun, toothbrush, shower, tv, heart
  category text default 'general',     -- medicine, meal, hygiene, activity, rest, social, general
  time_of_day time not null,           -- 08:00
  repeat_days int[] default '{1,2,3,4,5,6,7}', -- 1=Mon..7=Sun
  start_date date default current_date,
  end_date date,
  steps jsonb default '[]',            -- ["Take the white tablet", "Drink a glass of water"]
  caregiver_note text,                 -- "Tablet is in the blue box"
  encouragement text,                  -- "You're doing great, Amma"
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 5. Task instances (one row per task per day)
create table if not exists public.task_instances (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete cascade,
  scheduled_for timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending','done','snoozed','missed')),
  snoozed_until timestamptz,
  snooze_count int default 0,
  completed_at timestamptz,
  unique (task_id, scheduled_for)
);

-- 6. Chat between patient and caregivers
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patients(id) on delete cascade,
  sender_id uuid references public.profiles(id),
  sender_role text not null check (sender_role in ('patient','caregiver')),
  kind text not null default 'text' check (kind in ('preset','text')),
  body text not null,
  read_at timestamptz,
  created_at timestamptz default now()
);

-- 7. Alerts shown on the caregiver dashboard
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patients(id) on delete cascade,
  type text not null check (type in ('help','missed_task','inactive')),
  task_instance_id uuid references public.task_instances(id),
  message text,
  created_at timestamptz default now(),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id)
);

-- 8. Family contacts shown on the patient side
create table if not exists public.family_contacts (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patients(id) on delete cascade,
  name text not null,
  relation text not null,              -- "Son", "Granddaughter"
  phone text,
  photo_url text,
  sort_order int default 0
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.caregiver_patients enable row level security;
alter table public.tasks enable row level security;
alter table public.task_instances enable row level security;
alter table public.messages enable row level security;
alter table public.alerts enable row level security;
alter table public.family_contacts enable row level security;

-- Helper security definer function to avoid recursive policies
create or replace function public.is_caregiver_for(p_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.caregiver_patients
    where caregiver_id = auth.uid()
      and patient_id = p_id
  );
$$;

-- PROFILES policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Caregivers can view linked patients profile"
  on public.profiles for select
  using (public.is_caregiver_for(id));

create policy "Patients can view linked caregivers profile"
  on public.profiles for select
  using (
    exists (
      select 1 from public.caregiver_patients
      where patient_id = auth.uid()
        and caregiver_id = profiles.id
    )
  );

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- PATIENTS policies
create policy "Patient can view own patient record"
  on public.patients for select
  using (id = auth.uid());

create policy "Caregiver can view linked patient records"
  on public.patients for select
  using (public.is_caregiver_for(id));

create policy "Caregiver can update linked patient records"
  on public.patients for update
  using (public.is_caregiver_for(id));

-- CAREGIVER_PATIENTS policies
create policy "Caregivers can view their patient links"
  on public.caregiver_patients for select
  using (caregiver_id = auth.uid());

create policy "Patients can view their caregiver links"
  on public.caregiver_patients for select
  using (patient_id = auth.uid());

create policy "Caregivers can insert patient links"
  on public.caregiver_patients for insert
  with check (caregiver_id = auth.uid());

create policy "Caregivers can delete patient links"
  on public.caregiver_patients for delete
  using (caregiver_id = auth.uid());

-- TASKS policies
create policy "Caregivers can view tasks of linked patients"
  on public.tasks for select
  using (public.is_caregiver_for(patient_id));

create policy "Patients can view their own tasks"
  on public.tasks for select
  using (patient_id = auth.uid());

create policy "Caregivers can insert tasks"
  on public.tasks for insert
  with check (public.is_caregiver_for(patient_id));

create policy "Caregivers can update tasks"
  on public.tasks for update
  using (public.is_caregiver_for(patient_id));

create policy "Caregivers can delete tasks"
  on public.tasks for delete
  using (public.is_caregiver_for(patient_id));

-- TASK_INSTANCES policies
create policy "Caregivers can view task instances"
  on public.task_instances for select
  using (public.is_caregiver_for(patient_id));

create policy "Patients can view own task instances"
  on public.task_instances for select
  using (patient_id = auth.uid());

create policy "Caregivers can insert task instances"
  on public.task_instances for insert
  with check (public.is_caregiver_for(patient_id));

create policy "Caregivers can update task instances"
  on public.task_instances for update
  using (public.is_caregiver_for(patient_id));

create policy "Patients can update own task instances"
  on public.task_instances for update
  using (patient_id = auth.uid())
  with check (patient_id = auth.uid());

-- MESSAGES policies
create policy "Caregivers can view messages of linked patients"
  on public.messages for select
  using (public.is_caregiver_for(patient_id));

create policy "Patients can view own messages"
  on public.messages for select
  using (patient_id = auth.uid());

create policy "Caregivers can send messages"
  on public.messages for insert
  with check (
    sender_role = 'caregiver'
    and sender_id = auth.uid()
    and public.is_caregiver_for(patient_id)
  );

create policy "Patients can send messages"
  on public.messages for insert
  with check (
    sender_role = 'patient'
    and sender_id = auth.uid()
    and patient_id = auth.uid()
  );

create policy "Recipients can mark messages read"
  on public.messages for update
  using (
    (patient_id = auth.uid() and sender_role = 'caregiver')
    or (public.is_caregiver_for(patient_id) and sender_role = 'patient')
  );

-- ALERTS policies
create policy "Caregivers can view alerts"
  on public.alerts for select
  using (public.is_caregiver_for(patient_id));

create policy "Patients can view own alerts"
  on public.alerts for select
  using (patient_id = auth.uid());

create policy "Caregivers can insert alerts"
  on public.alerts for insert
  with check (public.is_caregiver_for(patient_id));

create policy "Patients can insert help alerts"
  on public.alerts for insert
  with check (
    type = 'help'
    and patient_id = auth.uid()
  );

create policy "Caregivers can resolve alerts"
  on public.alerts for update
  using (public.is_caregiver_for(patient_id));

-- FAMILY_CONTACTS policies
create policy "Caregivers can view family contacts"
  on public.family_contacts for select
  using (public.is_caregiver_for(patient_id));

create policy "Patients can view own family contacts"
  on public.family_contacts for select
  using (patient_id = auth.uid());

create policy "Caregivers can manage family contacts"
  on public.family_contacts for all
  using (public.is_caregiver_for(patient_id))
  with check (public.is_caregiver_for(patient_id));

-- ==========================================
-- REALTIME SUBSCRIPTIONS
-- ==========================================
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.alerts;
alter publication supabase_realtime add table public.task_instances;

