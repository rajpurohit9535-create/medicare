drop policy if exists "Caregivers can insert patient links"
  on public.caregiver_patients;

-- No replacement INSERT policy on purpose. With RLS enabled and no policy,
-- inserts from browser clients are denied. The service role bypasses RLS,
-- so server routes can still insert.

create or replace function public.is_caregiver_for(p_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.caregiver_patients
    where caregiver_id = auth.uid()
      and patient_id = p_id
  );
$$;
