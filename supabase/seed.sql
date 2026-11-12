-- CareCompanion Seed Data
-- 1 Caregiver (Ravi), 1 Patient (Amma), 8 Tasks, 3 Family Contacts

-- Caregiver Auth User & Profile
-- Ravi Sharma (caregiver@carecompanion.local / password123)
insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'caregiver@carecompanion.local',
  -- bcrypt hash for password123
  '$2b$10$ZkZPMD24x8WTBxQA/gY0oOdV9JWBXxe2eKFmzImPrhvmoEiiyG41.',
  now(),
  '{"provider": "email", "providers": ["email"], "role": "caregiver"}',
  '{"full_name": "Ravi Sharma", "role": "caregiver"}',
  now(),
  now()
) on conflict (id) do nothing;

insert into public.profiles (id, role, full_name, created_at)
values (
  '11111111-1111-1111-1111-111111111111',
  'caregiver',
  'Ravi Sharma',
  now()
) on conflict (id) do nothing;

-- Patient Auth User & Profile
-- Kamala Sharma "Amma" (family code AMMA-4821, PIN 1234)
insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values (
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'patient-amma@carecompanion.local',
  -- internal password hash
  '$2b$10$ZkZPMD24x8WTBxQA/gY0oOdV9JWBXxe2eKFmzImPrhvmoEiiyG41.',
  now(),
  '{"provider": "email", "providers": ["email"], "role": "patient"}',
  '{"full_name": "Kamala Sharma (Amma)", "role": "patient"}',
  now(),
  now()
) on conflict (id) do nothing;

insert into public.profiles (id, role, full_name, created_at)
values (
  '22222222-2222-2222-2222-222222222222',
  'patient',
  'Kamala Sharma',
  now()
) on conflict (id) do nothing;

-- Patient record
insert into public.patients (
  id,
  display_name,
  family_code,
  pin_hash,
  home_address,
  lives_with,
  timezone,
  created_at
) values (
  '22222222-2222-2222-2222-222222222222',
  'Amma',
  'AMMA-4821',
  -- bcrypt hash for PIN 1234
  '$2b$10$vpOPJjCKqUJ0C.Dt.4sLG.k.Dz9FLS4WdwYjL0Lr4z2LNJYcrQLLy',
  '42 Shanti Nilayam, 4th Cross, Indiranagar, Bengaluru',
  'Ravi (son), Priya (daughter-in-law), Arjun (grandson)',
  'Asia/Kolkata',
  now()
) on conflict (id) do nothing;

-- Link Caregiver and Patient
insert into public.caregiver_patients (caregiver_id, patient_id)
values (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
) on conflict do nothing;

-- Family Contacts
insert into public.family_contacts (patient_id, name, relation, phone, photo_url, sort_order)
values
  ('22222222-2222-2222-2222-222222222222', 'Ravi Sharma', 'Son', '+91 98765 43210', null, 1),
  ('22222222-2222-2222-2222-222222222222', 'Priya Sharma', 'Daughter-in-law', '+91 98765 43211', null, 2),
  ('22222222-2222-2222-2222-222222222222', 'Arjun Sharma', 'Grandson', '+91 98765 43212', null, 3)
on conflict do nothing;

-- 8 Sample Daily Tasks
insert into public.tasks (
  patient_id,
  title,
  icon,
  category,
  time_of_day,
  repeat_days,
  start_date,
  steps,
  caregiver_note,
  encouragement,
  is_active
) values
(
  '22222222-2222-2222-2222-222222222222',
  'Wake up & wash face',
  'sun',
  'hygiene',
  '07:00',
  '{1,2,3,4,5,6,7}',
  current_date,
  '["Sit up slowly and rest feet on floor", "Drink a sip of fresh water", "Wash face with warm water"]'::jsonb,
  'Take your time getting out of bed.',
  'Good morning, Amma! Wishing you a peaceful day.',
  true
),
(
  '22222222-2222-2222-2222-222222222222',
  'Brush teeth',
  'toothbrush',
  'hygiene',
  '07:30',
  '{1,2,3,4,5,6,7}',
  current_date,
  '["Put toothpaste on the blue toothbrush", "Brush gently for two minutes", "Rinse mouth with water"]'::jsonb,
  'Your blue toothbrush is on the right of the sink.',
  'You are doing wonderfully, Amma.',
  true
),
(
  '22222222-2222-2222-2222-222222222222',
  'Take morning tablet',
  'pill',
  'medicine',
  '08:00',
  '{1,2,3,4,5,6,7}',
  current_date,
  '["Take the white tablet from the morning box", "Drink a full glass of water"]'::jsonb,
  'Tablet is in the blue Monday pill box on the kitchen counter.',
  'Keeping your body healthy and strong!',
  true
),
(
  '22222222-2222-2222-2222-222222222222',
  'Breakfast',
  'utensils',
  'meal',
  '08:30',
  '{1,2,3,4,5,6,7}',
  current_date,
  '["Sit at the dining table", "Enjoy your warm breakfast and chutney", "Drink warm milk"]'::jsonb,
  'Breakfast is kept warm under the cover on the dining table.',
  'Enjoy your meal, Amma.',
  true
),
(
  '22222222-2222-2222-2222-222222222222',
  'Gentle garden walk',
  'walk',
  'activity',
  '10:00',
  '{1,2,3,4,5,6,7}',
  current_date,
  '["Put on your comfortable walking shoes", "Walk 5 calm rounds in the garden", "Sit on the garden bench"]'::jsonb,
  'Walking stick is by the front entrance.',
  'The fresh morning air is so good for you.',
  true
),
(
  '22222222-2222-2222-2222-222222222222',
  'Lunch',
  'utensils',
  'meal',
  '13:00',
  '{1,2,3,4,5,6,7}',
  current_date,
  '["Wash hands with soap", "Have warm rice, dal, and fresh vegetables", "Drink water"]'::jsonb,
  'Food is ready in the casserole on the kitchen dining table.',
  'Eat at your own calm pace.',
  true
),
(
  '22222222-2222-2222-2222-222222222222',
  'Afternoon rest',
  'bed',
  'rest',
  '14:30',
  '{1,2,3,4,5,6,7}',
  current_date,
  '["Lie down in your quiet bedroom", "Rest your eyes and relax for 45 minutes"]'::jsonb,
  'Curtains are drawn for soothing soft light.',
  'Rest well, Amma. You have had a lovely morning.',
  true
),
(
  '22222222-2222-2222-2222-222222222222',
  'Call family & evening tea',
  'phone',
  'social',
  '17:30',
  '{1,2,3,4,5,6,7}',
  current_date,
  '["Sip your warm herbal tea", "Tap Priya or Arjun to hear their voices"]'::jsonb,
  'Arjun arrives home from school around 5:15 PM.',
  'We love you so much, Amma.',
  true
);

