-- 20261027000002_secure_rls_roles.sql
-- Fecha o acesso aberto, impede auto-promoção a professor e prepara a aprovação de fichas.
-- Rode primeiro no projeto Supabase de TESTE. Não edite a migration inicial.
begin;

do $$
begin
  if to_regclass('public.profiles') is null or to_regclass('public.students') is null
     or to_regclass('public.workout_routines') is null or to_regclass('public.exercises') is null then
    raise exception 'Aplique primeiro 20261027000001_initial_schema.sql.';
  end if;
end;
$$;

-- 1) Remove as políticas abertas (anon e authenticated com acesso total)
drop policy if exists "Usuários podem ver seu próprio perfil" on public.profiles;
drop policy if exists "Usuários podem atualizar seu próprio perfil" on public.profiles;
drop policy if exists "Treinadores autenticados podem gerenciar alunos" on public.students;
drop policy if exists "Usuários autenticados podem visualizar e gerenciar rotinas" on public.workout_routines;
drop policy if exists "Usuários autenticados podem visualizar e gerenciar exercícios" on public.exercises;
drop policy if exists "Usuários podem ver e criar seus próprios logs de treino" on public.workout_logs;
drop policy if exists "Usuários podem visualizar e registrar medidas corporais" on public.body_measurements;
drop policy if exists "Usuários podem registrar seus próprios recordes pessoais" on public.personal_records;

-- 2) Cadastro: o papel NUNCA vem do cliente; todo novo usuário é "student"
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'student'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 3) Quem é professor? (consulta o papel gravado no banco)
create or replace function public.is_coach()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role in ('coach', 'admin')
  );
$$;
revoke all on function public.is_coach() from public, anon;
grant execute on function public.is_coach() to authenticated;

-- 4) Aprovação de fichas (fichas existentes ficam aprovadas)
alter table public.workout_routines
  add column if not exists approval text not null default 'approved'
  check (approval in ('pending', 'approved', 'rejected'));

-- 5) Privilégios mínimos: anon não acessa nada; o aluno não altera o próprio papel
revoke all on table public.profiles, public.students, public.workout_routines, public.exercises,
  public.workout_logs, public.body_measurements, public.personal_records from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;
grant select, insert, update, delete on public.students, public.workout_routines, public.exercises to authenticated;
grant select, insert on public.workout_logs, public.body_measurements to authenticated;
grant select, insert, update on public.personal_records to authenticated;

-- 6) Políticas (recriáveis sem erro)
drop policy if exists profiles_select on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.is_coach());
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists students_coach on public.students;
drop policy if exists students_self_select on public.students;
create policy students_coach on public.students for all to authenticated
  using (public.is_coach()) with check (public.is_coach());
create policy students_self_select on public.students for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists routines_select on public.workout_routines;
drop policy if exists routines_insert on public.workout_routines;
drop policy if exists routines_update on public.workout_routines;
drop policy if exists routines_delete on public.workout_routines;
create policy routines_select on public.workout_routines for select to authenticated
  using (user_id = (select auth.uid()) or public.is_coach());
create policy routines_insert on public.workout_routines for insert to authenticated
  with check (public.is_coach() or (user_id = (select auth.uid()) and approval = 'pending'));
create policy routines_update on public.workout_routines for update to authenticated
  using (public.is_coach()) with check (public.is_coach());
create policy routines_delete on public.workout_routines for delete to authenticated
  using (public.is_coach() or (user_id = (select auth.uid()) and approval = 'pending'));

drop policy if exists exercises_select on public.exercises;
drop policy if exists exercises_write on public.exercises;
create policy exercises_select on public.exercises for select to authenticated
  using (public.is_coach() or exists (
    select 1 from public.workout_routines r
    where r.id = exercises.routine_id and r.user_id = (select auth.uid())));
create policy exercises_write on public.exercises for all to authenticated
  using (public.is_coach() or exists (
    select 1 from public.workout_routines r
    where r.id = exercises.routine_id and r.user_id = (select auth.uid()) and r.approval = 'pending'))
  with check (public.is_coach() or exists (
    select 1 from public.workout_routines r
    where r.id = exercises.routine_id and r.user_id = (select auth.uid()) and r.approval = 'pending'));

drop policy if exists logs_select on public.workout_logs;
drop policy if exists logs_insert on public.workout_logs;
create policy logs_select on public.workout_logs for select to authenticated
  using (user_id = (select auth.uid()) or public.is_coach());
create policy logs_insert on public.workout_logs for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists measurements_select on public.body_measurements;
drop policy if exists measurements_insert on public.body_measurements;
create policy measurements_select on public.body_measurements for select to authenticated
  using (user_id = (select auth.uid()) or public.is_coach());
create policy measurements_insert on public.body_measurements for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists prs_select on public.personal_records;
drop policy if exists prs_insert on public.personal_records;
drop policy if exists prs_update on public.personal_records;
create policy prs_select on public.personal_records for select to authenticated
  using (user_id = (select auth.uid()) or public.is_coach());
create policy prs_insert on public.personal_records for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy prs_update on public.personal_records for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

commit;

-- Depois de aplicar, defina o professor UMA vez, no SQL Editor (o app não consegue fazer isso):
--   update public.profiles set role = 'coach' where email = 'EMAIL_DO_PROFESSOR';
