-- Autoriza somente a conta professor@academia.com a receber o papel de treinador.
-- O papel continua sendo atribuído no banco; metadados enviados pelo cliente são ignorados.
begin;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  assigned_role text := 'student';
begin
  if lower(coalesce(new.email, '')) = 'professor@academia.com'
     and new.email_confirmed_at is not null then
    assigned_role := 'coach';
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    assigned_role
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create or replace function public.promote_authorized_coach()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if lower(coalesce(new.email, '')) = 'professor@academia.com'
     and new.email_confirmed_at is not null then
    update public.profiles
    set role = 'coach', updated_at = now()
    where id = new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_promote_authorized_coach_insert on auth.users;
create trigger on_auth_user_promote_authorized_coach_insert
  after insert on auth.users
  for each row execute function public.promote_authorized_coach();

drop trigger if exists on_auth_user_promote_authorized_coach_confirmation on auth.users;
create trigger on_auth_user_promote_authorized_coach_confirmation
  after update of email_confirmed_at on auth.users
  for each row
  when (new.email_confirmed_at is not null)
  execute function public.promote_authorized_coach();

-- Também corrige uma conta existente, desde que o e-mail já esteja confirmado.
update public.profiles as profile
set role = 'coach', updated_at = now()
from auth.users as auth_user
where profile.id = auth_user.id
  and lower(coalesce(auth_user.email, '')) = 'professor@academia.com'
  and auth_user.email_confirmed_at is not null;

commit;
